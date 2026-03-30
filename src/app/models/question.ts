import { Choice } from "./choice";

export interface Question {
  id: string;
  text: string;
  choices: Choice[];
  correctChoiceIndex: number;
  image: string | null;
  timeoutSeconds: number;
}
