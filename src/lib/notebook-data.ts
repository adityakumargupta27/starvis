export interface Notebook {
  id: number;
  title: string;
  description: string;
}

export const notebooks: Notebook[] = [
  {
    id: 1,
    title: "Math Notes",
    description: "Notes on calculus and linear algebra.",
  },
  {
    id: 2,
    title: "History Notes",
    description: "Notes on the American Revolution.",
  },
  {
    id: 3,
    title: "Science Notes",
    description: "Notes on biology and chemistry.",
  },
];
