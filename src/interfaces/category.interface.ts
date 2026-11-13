import { Document } from 'mongoose';
import { Event } from './event.interface';

export interface Category extends Document {
    readonly category: string;
    description: string;
    events: Array<Event>;
}
export interface UpdateCategory extends Document {
    description: string;
    events: Array<Event>;
}
