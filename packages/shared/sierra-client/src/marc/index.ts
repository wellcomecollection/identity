export const varFieldTags = {
  barcode: 'b',
  email: 'z',
  notes: 'x',
  name: 'n',
  message: 'm',
} as const;

type VarFieldTag = typeof varFieldTags[keyof typeof varFieldTags];

export type SubField = {
  tag: string;
  content: string;
};

export type VarField = {
  fieldTag: VarFieldTag;
  marcTag?: string;
  content?: string;
  ind1?: string;
  ind2?: string;
  subfields?: SubField[];
};

export function getVarFieldContent(
  varFields: VarField[],
  fieldTag: string
): string[] {
  return varFields
    .filter((varField) => varField.fieldTag === fieldTag)
    .map((field) => field.content)
    .filter((content): content is string => !!content);
}
