import { TestListItem, Test } from "@/types/test";
import { FiClipboard } from "react-icons/fi";

export const mapTestFromApi = (test: TestListItem): Test => {
    return {
        id: test.external_id,
        name: test.name,
        description: test.description ?? "Sin descripción",
        frequencyMonths: test.frequency_months,
        icon: <FiClipboard />,
        exercises: test.exercises ?? [],
    };
};