import { Document } from 'mongoose';
import { Category } from './category.interface';

export interface Player extends Document {
    name: string;
    readonly email: string;
    readonly phoneNumber: string;
    category: Category;
    ranking: string;
    positionRanking: number;
    urlPhoto: string;
}
