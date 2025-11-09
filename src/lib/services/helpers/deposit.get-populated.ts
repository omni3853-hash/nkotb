import { ClientSession, Types } from "mongoose";
import { Deposit } from "@/lib/models/deposit.model";
import { depositPopulate } from "@/lib/services/helpers/deposit.populate";
import type { IDepositPopulated } from "@/lib/models/deposit.model";

export async function getPopulatedDepositById(
  id: Types.ObjectId | string,
  session?: ClientSession
) {
  const query = Deposit.findById(id)
    .populate(depositPopulate)
    .lean<IDepositPopulated>();

  if (session) {
    query.session(session);
  }

  const doc = await query;
  return doc as IDepositPopulated | null;
}
