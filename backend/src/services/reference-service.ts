import { referenceRepository } from "../db/repositories/reference-repository";
import { ApiError } from "../utils/api-error";

export const referenceService = {
  getAllReferences: async () => {
    return referenceRepository.findAll();
  },

  getReferenceById: async (id: number) => {
    const reference = await referenceRepository.findById(id);
    if (!reference) {
      throw new ApiError(404, "Reference not found");
    }
    return reference;
  },

  createReference: async (referenceData: {
    name: string;
    description?: string;
  }) => {
    const { name, description } = referenceData;

    return referenceRepository.create({
      name,
      description,
    });
  },

  updateReference: async (
    id: number,
    referenceData: { name?: string; description?: string }
  ) => {
    const { name, description } = referenceData;

    return referenceRepository.update(id, {
      name,
      description,
    });
  },

  deleteReference: async (id: number) => {
    return referenceRepository.delete(id);
  },
};
