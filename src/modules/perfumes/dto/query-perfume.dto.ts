import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryPerfumeDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 12;

    @IsString()
    @IsOptional()
    search?: string;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    type?: string;

    @Type(() => Number)
    @IsOptional()
    minPrice?: number;

    @Type(() => Number)
    @IsOptional()
    maxPrice?: number;
}
