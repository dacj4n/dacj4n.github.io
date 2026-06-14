// Diary data configuration file
// Used to manage data for the diary display page
const diaryModules = import.meta.glob('../content/diary/**/*.json', { eager: true });

export interface Moment {
    id: string;
    title?: string;
    content: string;
    date: string;
    images?: string[];
    basePath?: string;
}

export const moments: Moment[] = Object.entries(diaryModules).map(([path, mod]: [string, any]) => {
    const id = path.split('/').pop()?.replace('.json', '') || '';
    const data = mod.default as any;
    const basePath = path.replace('../', '').replace(/\/[^/]+$/, '');
    const moment: Moment = {
        id,
        ...data,
        basePath,
    };
    return moment;
});

// Sort moments by date in descending order
export const sortedMoments = [...moments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export interface MonthGroup {
    month: number;
    moments: Moment[];
}

export interface YearGroup {
    year: number;
    months: MonthGroup[];
}

export const groupedMoments: YearGroup[] = (() => {
    const map = new Map<number, Map<number, Moment[]>>();
    for (const m of sortedMoments) {
        const d = new Date(m.date);
        const y = d.getFullYear();
        const mo = d.getMonth() + 1;
        if (!map.has(y)) map.set(y, new Map());
        const yearMap = map.get(y)!;
        if (!yearMap.has(mo)) yearMap.set(mo, []);
        yearMap.get(mo)!.push(m);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => b - a)
        .map(([year, monthMap]) => ({
            year,
            months: Array.from(monthMap.entries())
                .sort(([a], [b]) => b - a)
                .map(([month, moments]) => ({ month, moments })),
        }));
})();