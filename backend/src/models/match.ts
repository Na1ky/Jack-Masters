import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  matchId: string;
  players: Array<{ id: string; nickname: string; total: number }>;
  winner: string;
  points: Record<string, number>;
  createdAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  matchId: { type: String, required: true, unique: true },
  players: [
    {
      id: { type: String, required: true },
      nickname: { type: String, required: true },
      total: { type: Number, required: true },
    },
  ],
  winner: { type: String, required: true },
  points: { type: Map, of: Number },
  createdAt: { type: Date, default: Date.now },
});

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
