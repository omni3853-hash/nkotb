// src/lib/services/helpers/deposit.get-populated.ts
import { ClientSession, Types } from "mongoose";
import { Deposit } from "@/lib/models/deposit.model";
import { depositPopulate } from "@/lib/services/helpers/deposit.populate";
import type { IDepositPopulated } from "@/lib/models/deposit.model";

export async function getPopulatedDepositById(
  id: Types.ObjectId | string,
  session?: ClientSession
) {
  // NOTE: session?.id guards; Mongoose accepts undefined session too.
  const q = Deposit.findById(id).populate(depositPopulate).lean<IDepositPopulated>();
  if (session) q.session(session);
  const doc = await q;
  return doc as IDepositPopulated | null;
}
