<script lang="ts">
    import { onMount } from "svelte";
    import type { YearGroup } from "@utils/diary";

    let { groupedMoments = [] as YearGroup[] } = $props<{
        groupedMoments: YearGroup[];
    }>();

    let activeMonthId = $state<string>("");
    let expandedYears = $state<Record<number, boolean>>({});

    function getMonthId(year: number, month: number): string {
        return `diary-m-${year}-${String(month).padStart(2, "0")}`;
    }

    function scrollToMonth(year: number, month: number) {
        const id = getMonthId(year, month);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            activeMonthId = id;
        }
    }

    function toggleYear(year: number) {
        expandedYears[year] = !expandedYears[year];
        expandedYears = expandedYears;
    }

    function monthLabel(m: number): string {
        return `${String(m).padStart(2, "0")}月`;
    }

    onMount(() => {
        // Auto-expand current year on mount
        const now = new Date();
        expandedYears[now.getFullYear()] = true;
        expandedYears = expandedYears;

        // IntersectionObserver for headings
        const ids: string[] = [];
        for (const yg of groupedMoments) {
            for (const mg of yg.months) {
                ids.push(getMonthId(yg.year, mg.month));
            }
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        activeMonthId = entry.target.id;
                    }
                }
            },
            { rootMargin: "-10% 0px -80% 0px" },
        );

        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    });
</script>

<div class="diary-timeline text-sm">
    {#each groupedMoments as yearGroup (yearGroup.year)}
        <div class="year-group">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="year-header flex items-center gap-1 px-1 py-1 cursor-pointer rounded hover:bg-(--btn-plain-bg-hover) transition-colors"
                onclick={() => toggleYear(yearGroup.year)}
            >
                <svg
                    class="w-3 h-3 shrink-0 transition-transform {expandedYears[yearGroup.year] ? 'rotate-90' : ''}"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span class="font-medium text-90">{yearGroup.year}</span>
            </div>

            {#if expandedYears[yearGroup.year]}
                <div class="month-list ml-2 pl-2 border-l border-(--line-divider)">
                    {#each yearGroup.months as monthGroup (monthGroup.month)}
                        {@const mid = getMonthId(yearGroup.year, monthGroup.month)}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="month-item px-2 py-0.5 cursor-pointer rounded text-75 hover:text-(--primary) hover:bg-(--btn-plain-bg-hover) transition-colors {activeMonthId === mid ? 'text-(--primary) font-medium' : ''}"
                            onclick={() => scrollToMonth(yearGroup.year, monthGroup.month)}
                        >
                            {monthLabel(monthGroup.month)}
                            <span class="text-50 ml-1 text-xs">({monthGroup.moments.length})</span>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/each}
</div>
