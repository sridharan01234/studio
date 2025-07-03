
'use client';

import { updateChecklistItem } from "@/services/instanceService";
import type { Checklist } from "@/types/instance";
import { useEffect } from "react";

type ChecklistUpdaterProps = {
  instanceId: string;
  item: keyof Checklist;
};

export default function ChecklistUpdater({ instanceId, item }: ChecklistUpdaterProps) {
  useEffect(() => {
    updateChecklistItem(instanceId, item);
  }, [instanceId, item]);

  return null;
}
