export const MirageLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-8">
            <div className="w-12 h-12 border-2 border-vivid-cyan/30 border-t-vivid-cyan rounded-full animate-spin" />
            <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-black animate-pulse">Synchronizing...</p>
        </div>
    );
};
