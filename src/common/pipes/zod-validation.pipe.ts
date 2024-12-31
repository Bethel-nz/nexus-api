import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, z } from 'zod';

/**
 * A validation pipe that uses Zod schemas to validate incoming request data
 * 
 * @example
 * // Define a schema
 * const userSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 * 
 * // Use in a controller
 * @Post()
 * @UsePipes(new ZodValidationPipe(userSchema))
 * create(@Body() data: z.infer<typeof userSchema>) {
 *   return this.service.create(data);
 * }
 * 
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
	constructor(private schema: ZodSchema) { }

	/**
	 * Transforms and validates the incoming data using the provided Zod schema
	 * 
	 * @param value - The value to validate
	 * @throws {BadRequestException} - If validation fails
	 * @returns The validated and transformed data
	 */
	async transform(value: unknown) {
		try {
			return await this.schema.parseAsync(value);
		} catch (error) {
			throw new BadRequestException('Validation failed', {
				cause: error,
				description: error.errors,
			});
		}
	}
} 