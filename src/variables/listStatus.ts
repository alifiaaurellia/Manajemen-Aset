import { StatusModel } from "../models/statusModel";

export const LISTSTATUS: StatusModel[] = [
  {
    label: "Ready",
    value: "READY",
  },
  {
    label: "Rented",
    value: "PROCESS",
  },
  {
    label: "Cancel",
    value: "CANCEL",
  },
  {
    label: "Done",
    value: "DONE",
  },
  {
    label: "Request",
    value: "REQUEST",
  },
];
