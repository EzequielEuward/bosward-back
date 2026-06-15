import {
    IsArray,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    Min,
} from 'class-validator';

export class CreatePerfumeDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    brand: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price: number;

    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    containerMaterial?: string;

    @IsString()
    @IsOptional()
    size?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    aromas?: string[];

    @IsNumber()
    @Min(0)
    stock: number;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;
}
