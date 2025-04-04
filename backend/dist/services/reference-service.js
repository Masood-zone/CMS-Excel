"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceService = void 0;
const reference_repository_1 = require("../db/repositories/reference-repository");
const api_error_1 = require("../utils/api-error");
exports.referenceService = {
    getAllReferences: async () => {
        return reference_repository_1.referenceRepository.findAll();
    },
    getReferenceById: async (id) => {
        const reference = await reference_repository_1.referenceRepository.findById(id);
        if (!reference) {
            throw new api_error_1.ApiError(404, "Reference not found");
        }
        return reference;
    },
    createReference: async (referenceData) => {
        const { name, description } = referenceData;
        return reference_repository_1.referenceRepository.create({
            name,
            description,
        });
    },
    updateReference: async (id, referenceData) => {
        const { name, description } = referenceData;
        return reference_repository_1.referenceRepository.update(id, {
            name,
            description,
        });
    },
    deleteReference: async (id) => {
        return reference_repository_1.referenceRepository.delete(id);
    },
};
//# sourceMappingURL=reference-service.js.map