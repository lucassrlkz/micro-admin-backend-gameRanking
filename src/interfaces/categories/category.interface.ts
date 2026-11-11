import { Document } from 'mongoose';
import { Player } from '../players/player.interface';
import { Event } from '../event.interface';

export interface Category extends Document {
  readonly category: string;
  description: string;
  events: Array<Event>;
  players: Array<Player>;
}
