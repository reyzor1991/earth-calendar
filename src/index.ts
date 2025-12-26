const moduleName = "earth-calendar";

const DEFAULT_CALENDAR_CONFIG = {
    time: {
        secondsInMinute: 60,
        minutesInHour: 60,
        hoursInDay: 24
    },
    weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    months: [
        {name: "January", days: 31},
        {name: "February", days: 28},
        {name: "March", days: 31},
        {name: "April", days: 30},
        {name: "May", days: 31},
        {name: "June", days: 30},
        {name: "July", days: 31},
        {name: "August", days: 31},
        {name: "September", days: 30},
        {name: "October", days: 31},
        {name: "November", days: 30},
        {name: "December", days: 31}
    ],
    leapRule: {
        interval: 4,
        monthIndex: 1,
        addDays: 1
    }
}

const TIME_ZONES = {
    utc: 'UTC',
    london: 'Europe/London',
    paris: 'Europe/Paris',
    berlin: 'Europe/Berlin',
    kyiv: 'Europe/Kyiv',
    warsaw: 'Europe/Warsaw',
    newYork: 'America/New_York',
    chicago: 'America/Chicago',
    denver: 'America/Denver',
    losAngeles: 'America/Los_Angeles',
    mexicoCity: 'America/Mexico_City',
    saoPaulo: 'America/Sao_Paulo',
    toronto: 'America/Toronto',
    tokyo: 'Asia/Tokyo',
    seoul: 'Asia/Seoul',
    shanghai: 'Asia/Shanghai',
    singapore: 'Asia/Singapore',
    kolkata: 'Asia/Kolkata',
    bangkok: 'Asia/Bangkok',
    dubai: 'Asia/Dubai',
    jerusalem: 'Asia/Jerusalem',
    cairo: 'Africa/Cairo',
    nairobi: 'Africa/Nairobi',
    johannesburg: 'Africa/Johannesburg',
    lagos: 'Africa/Lagos',
    casablanca: 'Africa/Casablanca',
    sydney: 'Australia/Sydney',
    melbourne: 'Australia/Melbourne',
    auckland: 'Pacific/Auckland',
    honolulu: 'Pacific/Honolulu'
}

function isActiveGM() {
    return game.user === game.users.activeGM;
}

Hooks.on("init", async () => {

    game.settings.register(moduleName, "calendarFormatStyle", {
        scope: "world",
        config: true,
        name: `${moduleName}.SETTINGS.calendarFormatStyle.name`,
        hint: `${moduleName}.SETTINGS.calendarFormatStyle.hint`,
        type: String,
        choices: {
            "en-US": game.i18n.localize(`${moduleName}.SETTINGS.calendarFormatStyle.us`),
            "en-GB": game.i18n.localize(`${moduleName}.SETTINGS.calendarFormatStyle.eu`),
        },
        default: "en-GB",
        onChange: (_value: any) => {
            rerenderTime(ui.players.element)
        },
    });

    game.settings.register(moduleName, "currentTimeZone", {
        scope: "world",
        config: true,
        name: `${moduleName}.SETTINGS.currentTimeZone.name`,
        hint: `${moduleName}.SETTINGS.currentTimeZone.hint`,
        type: String,
        default: 'utc',
        choices: TIME_ZONES,
        onChange: (_value: any) => {
            rerenderTime(ui.players.element)
        },
    });

    game.settings.register(moduleName, "useCustomConfig", {
        scope: "world",
        config: true,
        name: `${moduleName}.SETTINGS.useCustomConfig.name`,
        hint: `${moduleName}.SETTINGS.useCustomConfig.hint`,
        type: Boolean,
        default: false,
        onChange: (_value: any) => {
            rerenderTime(ui.players.element)
        },
    });

    game.settings.registerMenu(moduleName, "calendarConfig", {
        name: "Calendar Config",
        label: "Manage Calendar Config",
        icon: "fas fa-clock",
        type: CalendarConfigForm,
        restricted: true,
    });

    game.settings.register(moduleName, "customCalendarConfig", {
        scope: "world",
        config: false,
        type: Object,
        default: DEFAULT_CALENDAR_CONFIG,
        onChange: (_value: any) => {
            rerenderTime(ui.players.element)
        },
    });

});

class CalendarConfigForm extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${moduleName}-calendar-config-form`,
        classes: [moduleName],
        window: {
            title: "Calendar config",
            resizable: true
        },
        actions: {},
        form: {
            handler: this.formHandler,
            closeOnSubmit: false
        },
    };

    static PARTS = {
        base: {
            template: `modules/${moduleName}/templates/base.hbs`,
        },
    };

    static async formHandler(event: SubmitEvent | Event, form: HTMLFormElement, formData: FormData & { object: Record<string, unknown> }) {
        const data = formData.object as { [key: string]: boolean; };
        console.log('Data for save')
        console.log(data)
    }

    async _prepareContext(options: { parts: string[] }) {
        let context = await super._prepareContext(options);

        context = foundry.utils.mergeObject(context, {
            calendarConfig: Settings.get("customCalendarConfig"),
        });

        return context;
    }
}

Hooks.on("renderPlayers", (_app: object, html: HTMLElement, _playes: object, _options: any) => {
    rerenderTime(html)
})

Hooks.on('updateWorldTime', () => {
    rerenderTime(ui.players.element)
})

class Settings {
    static get(name: string) {
        return game.settings.get(moduleName, name);
    };
}

function getFormattedDate() {
    if (Settings.get("useCustomConfig")) {
        let cfg = Settings.get("customCalendarConfig");
        return secondsToDateString(cfg, game.time.worldTime)
    }

    const timeZone = Settings.get("currentTimeZone");
    const date = new Date(game.time.worldTime * 1000); // assuming epoch in seconds
    return date.toLocaleString(Settings.get("calendarFormatStyle"), {
        timeZone: TIME_ZONES[timeZone],
        hour12: false,
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }) + ` ${TIME_ZONES[timeZone]}`;
}

function rerenderTime(html: HTMLElement) {
    const existing = html.querySelector(".calendar-current-time .time");
    const content = `Current Date:<br/>${getFormattedDate()}`;

    if (existing) {
        existing.innerHTML = content;
    } else {
        const minusMonthBtn = createBtn('fa-circle-arrow-left');
        const minusDayBtn = createBtn('fa-circle-chevron-left');
        const minusHourBtn = createBtn('fa-caret-left');
        const minusMinBtn = createBtn('fa-angles-left');
        const minusSecBtn = createBtn('fa-angle-left');
        const setTimeBtn = createBtn('fa-arrows-left-right');
        const plusSecBtn = createBtn('fa-angle-right');
        const plusMinBtn = createBtn('fa-angles-right');
        const plusHourBtn = createBtn('fa-caret-right');
        const plusDayBtn = createBtn('fa-circle-chevron-right');
        const plusMonthBtn = createBtn('fa-circle-arrow-right');

        const newEl = foundry.utils.parseHTML(
            `<div class="calendar-current-time" style="margin-top: 10px;">
                <div class="time">${content}</div>
                <div class="btns"></div>
            </div>`
        );
        const btnContainer = newEl.querySelector('.btns') as Element;
        html.appendChild(newEl);

        if (isActiveGM()) {
            btnContainer.append(
                minusMonthBtn,
                minusDayBtn,
                minusHourBtn,
                minusMinBtn,
                minusSecBtn,
                setTimeBtn,
                plusSecBtn,
                plusMinBtn,
                plusHourBtn,
                plusDayBtn,
                plusMonthBtn
            );

            let advConfig = getAdvConfig();

            setTimeBtn.addEventListener("click", async (e) => {
                const resp = await foundry.applications.api.DialogV2.input({
                    window: {
                        title: "Set new time",
                    },
                    content: `<label>Time</label><input type="number" name="time" value="${game.time.worldTime}">`
                })
                if (!Number.isNumeric(resp?.time)) return;

                game.time.set(Number(resp.time));
            })
            minusSecBtn.addEventListener("click", async (e) => {
                game.time.advance(-1)
            })
            minusMinBtn.addEventListener("click", async (e) => {
                game.time.advance(-1 * advConfig.advMinute)
            })
            minusHourBtn.addEventListener("click", async (e) => {
                game.time.advance(-1 * advConfig.advHour)
            })
            minusDayBtn.addEventListener("click", async (e) => {
                game.time.advance(-1 * advConfig.advDay)
            })
            minusMonthBtn.addEventListener("click", async (e) => {
                game.time.set(advConfig.advMonth(-1))
            })
            plusSecBtn.addEventListener("click", async (e) => {
                game.time.advance(1)
            })
            plusMinBtn.addEventListener("click", async (e) => {
                game.time.advance(advConfig.advMinute)
            })
            plusHourBtn.addEventListener("click", async (e) => {
                game.time.advance(advConfig.advHour)
            })
            plusDayBtn.addEventListener("click", async (e) => {
                game.time.advance(advConfig.advDay)
            })
            plusMonthBtn.addEventListener("click", async (e) => {
                game.time.set(advConfig.advMonth(+1))
            })
        }
    }
}

function createBtn(iconClass: string) {
    return foundry.utils.parseHTML(
        `<button type="button" class="icon fa-solid ${iconClass}"></button>`
    );
}

function buildMonthCache(cfg) {
    const normal = [0];
    const leap = [0];
    for (let i = 0; i < cfg.months.length; i++) {
        normal.push(normal[i] + cfg.months[i].days);
        let d = cfg.months[i].days;
        if (cfg.leapRule && cfg.leapRule.interval > 0 && i === cfg.leapRule.monthIndex) {
            d += cfg.leapRule.addDays;
        }
        leap.push(leap[i] + d);
    }
    return {normal, leap};
}

function isLeapYear(cfg, year) {
    const rule = cfg.leapRule;
    if (!rule || !rule.interval || rule.interval <= 0) return false;
    return year % rule.interval === 0;
}

function daysInYear(cfg, year, cache) {
    const arr = isLeapYear(cfg, year) ? cache.leap : cache.normal;
    return arr[arr.length - 1];
}

function computeLeapCycle(cfg, cache) {
    const rule = cfg.leapRule;
    if (!rule || !rule.interval || rule.interval <= 0) {
        return {interval: 1, days: daysInYear(cfg, 1, cache)};
    }
    let days = 0;
    for (let i = 1; i <= rule.interval; i++) {
        days += daysInYear(cfg, i, cache);
    }
    return {interval: rule.interval, days};
}

function computeMegaCycle(cfg, cache) {
    const base = computeLeapCycle(cfg, cache);
    const blockInterval = base.interval * 100; // tune as needed
    let days = 0;
    for (let i = 1; i <= blockInterval; i++) {
        days += daysInYear(cfg, i, cache);
    }
    return {interval: blockInterval, days};
}

function findMonthDay(cfg, year, dayOfYear, cache) {
    const arr = isLeapYear(cfg, year) ? cache.leap : cache.normal;
    let lo = 0, hi = arr.length - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (dayOfYear < arr[mid]) hi = mid;
        else lo = mid + 1;
    }
    const monthIndex = lo - 1;
    const day = dayOfYear - arr[monthIndex] + 1;
    return {monthIndex, day};
}

function secondsToDateString(cfg, totalSeconds) {
    const {secondsInMinute, minutesInHour, hoursInDay} = cfg.time;
    const secondsInHour = secondsInMinute * minutesInHour;
    const secondsInDay = hoursInDay * secondsInHour;

    const totalDays = Math.floor(totalSeconds / secondsInDay);
    let leftover = totalSeconds % secondsInDay;

    // build caches once
    if (!cfg._cache) {
        cfg._cache = buildMonthCache(cfg);
        cfg._cycle = computeLeapCycle(cfg, cfg._cache);
        cfg._mega = computeMegaCycle(cfg, cfg._cache);
    }
    const cache = cfg._cache;

    let year = 1;
    let daysLeft = totalDays;

    // skip mega cycles
    if (cfg._mega.interval > 1) {
        const megaCycles = Math.floor(daysLeft / cfg._mega.days);
        year += megaCycles * cfg._mega.interval;
        daysLeft -= megaCycles * cfg._mega.days;
    }

    // skip leap cycles
    if (cfg._cycle.interval > 1) {
        const cycles = Math.floor(daysLeft / cfg._cycle.days);
        year += cycles * cfg._cycle.interval;
        daysLeft -= cycles * cfg._cycle.days;
    }

    // finish year-by-year (at most < interval years)
    while (true) {
        const yearDays = daysInYear(cfg, year, cache);
        if (daysLeft < yearDays) break;
        daysLeft -= yearDays;
        year++;
    }

    // month + day
    const {monthIndex, day} = findMonthDay(cfg, year, daysLeft, cache);

    // time
    const hour = Math.floor(leftover / secondsInHour);
    leftover %= secondsInHour;
    const minute = Math.floor(leftover / secondsInMinute);
    const second = leftover % secondsInMinute;

    // weekday
    const weekdayIndex = totalDays % cfg.weekdays.length;
    const weekdayName = cfg.weekdays[weekdayIndex];

    const monthName = cfg.months[monthIndex].name;
    return `${weekdayName}, ${day} ${monthName} Year ${year} at ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function pad(num) {
    return num.toString().padStart(2, "0");
}

function getAdvConfig() {
    let config = {
        advMinute: 60,
        advHour: 3600,
        advDay: 86400,
        advMonth: (correlation): number => {
            const d = new Date(game.time.worldTime * 1000)
            return d.setMonth(d.getMonth() + correlation) / 1000
        },
    }

    if (Settings.get("useCustomConfig")) {
        const cfg = Settings.get("customCalendarConfig");

        cfg.advMinute = cfg.time.secondsInMinute;
        cfg.advHour = cfg.time.secondsInMinute * cfg.time.minutesInHour;
        cfg.advDay = cfg.time.secondsInMinute * cfg.time.minutesInHour * cfg.time.hoursInDay;
        cfg.advMonth = (correlation): number => {
            return addMonthsToSeconds(cfg, game.time.worldTime, correlation)
        };
    }

    return config;
}

function addMonths(cfg, year, monthIndex, day, delta) {
    let newMonth = monthIndex + delta;
    let newYear = year;

    while (newMonth < 0) {
        newYear--;
        if (newYear < 1) throw new Error("Year below 1 not supported");
        newMonth += cfg.months.length;
    }

    while (newMonth >= cfg.months.length) {
        newMonth -= cfg.months.length;
        newYear++;
    }

    // Clamp day to max of new month (consider leap)
    const maxDay = isLeapYear(cfg, newYear) && cfg.leapRule?.monthIndex === newMonth
        ? cfg.months[newMonth].days + cfg.leapRule.addDays
        : cfg.months[newMonth].days;

    const newDay = Math.min(day, maxDay);

    return { year: newYear, monthIndex: newMonth, day: newDay };
}

function addMonthsToSeconds(cfg, totalSeconds, deltaMonths) {
    // convert seconds → date
    const {secondsInMinute, minutesInHour, hoursInDay} = cfg.time;
    const secondsInHour = secondsInMinute * minutesInHour;
    const secondsInDay = hoursInDay * secondsInHour;

    // totalDays
    const totalDays = Math.floor(totalSeconds / secondsInDay);
    let leftover = totalSeconds % secondsInDay;

    if (!cfg._cache) {
        cfg._cache = buildMonthCache(cfg);
        cfg._cycle = computeLeapCycle(cfg, cfg._cache);
        cfg._mega = computeMegaCycle(cfg, cfg._cache);
    }
    const cache = cfg._cache;

    // determine current year/month/day
    let year = 1;
    let daysLeft = totalDays;

    if (cfg._mega.interval > 1) {
        const megaCycles = Math.floor(daysLeft / cfg._mega.days);
        year += megaCycles * cfg._mega.interval;
        daysLeft -= megaCycles * cfg._mega.days;
    }

    if (cfg._cycle.interval > 1) {
        const cycles = Math.floor(daysLeft / cfg._cycle.days);
        year += cycles * cfg._cycle.interval;
        daysLeft -= cycles * cfg._cycle.days;
    }

    while (true) {
        const yearDays = daysInYear(cfg, year, cache);
        if (daysLeft < yearDays) break;
        daysLeft -= yearDays;
        year++;
    }

    const {monthIndex, day} = findMonthDay(cfg, year, daysLeft, cache);

    const hour = Math.floor(leftover / secondsInHour);
    leftover %= secondsInHour;
    const minute = Math.floor(leftover / secondsInMinute);
    const second = leftover % secondsInMinute;

    // add/subtract months
    const newDate = addMonths(cfg, year, monthIndex, day, deltaMonths);

    // convert back to seconds
    return secondsFromDate(cfg, newDate.year, newDate.monthIndex, newDate.day, hour, minute, second);
}