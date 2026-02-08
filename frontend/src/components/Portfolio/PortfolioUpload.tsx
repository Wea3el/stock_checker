import { useCallback } from "react";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { useUploadPortfolio } from "../../hooks/usePortfolio";

export default function PortfolioUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const { mutate, isPending, isError, error } = useUploadPortfolio();

  const handleFile = useCallback(
    (file: File) => {
      mutate(file, { onSuccess: () => onUploadSuccess?.() });
    },
    [mutate, onUploadSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors"
    >
      {isPending ? (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p>Parsing portfolio...</p>
        </div>
      ) : (
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-700">
              Upload Fidelity CSV
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Export Portfolio_Positions.csv from Fidelity.com and drop it here
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <FileUp className="w-4 h-4" />
            Choose File
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      )}
      {isError && (
        <p className="mt-3 text-sm text-red-600">
          {(error as Error)?.message || "Failed to upload"}
        </p>
      )}
    </div>
  );
}
