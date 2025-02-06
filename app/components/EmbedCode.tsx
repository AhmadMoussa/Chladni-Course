interface EmbedCodeProps {
  sketchPath: string;
  width?: string;
  height?: string;
}

const EmbedCode: React.FC<EmbedCodeProps> = ({ 
  sketchPath, 
  width = "100%", 
  height = "600px" 
}) => {
  const embedUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/embed${sketchPath}`;
  const embedCode = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Embed Code
      </label>
      <div className="relative">
        <textarea
          readOnly
          value={embedCode}
          className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm"
          rows={3}
          onClick={(e) => {
            const textarea = e.currentTarget;
            textarea.select();
            navigator.clipboard.writeText(textarea.value);
          }}
        />
        <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400">
          Click to copy
        </div>
      </div>
    </div>
  );
};

export default EmbedCode; 