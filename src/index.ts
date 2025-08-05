const moduleName = "earth-calendar";

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
        name: `${moduleName}.SETTINGS.currentTimeZone.name`,
        hint: `${moduleName}.SETTINGS.currentTimeZone.hint`,
        type: String,
        default: 'utc',
        choices: TIME_ZONES,
        onChange: (_value: any) => {
            rerenderTime(ui.players.element)
        },
    });

});

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

function rerenderTime(html: HTMLElement) {
    const timeZone = Settings.get("currentTimeZone");

    const date = new Date(game.time.worldTime * 1000); // assuming epoch in seconds
    const formattedDate = date.toLocaleString(Settings.get("calendarFormatStyle"), {
        timeZone: TIME_ZONES[timeZone],
        hour12: false,
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }) + ` ${TIME_ZONES[timeZone]}`;

    const existing = html.querySelector(".calendar-current-time .time");
    const content = `Current Date:<br/>${formattedDate}`;

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

        html.appendChild(newEl);

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
            game.time.advance(-60)
        })

        minusHourBtn.addEventListener("click", async (e) => {
            game.time.advance(-3600)
        })

        minusDayBtn.addEventListener("click", async (e) => {
            game.time.advance(-86400)
        })

        minusMonthBtn.addEventListener("click", async (e) => {
            const d = new Date(game.time.worldTime * 1000)
            game.time.set((d.setMonth(d.getMonth() - 1) / 1000))
        })

        plusSecBtn.addEventListener("click", async (e) => {
            game.time.advance(1)
        })

        plusMinBtn.addEventListener("click", async (e) => {
            game.time.advance(60)
        })

        plusHourBtn.addEventListener("click", async (e) => {
            game.time.advance(3600)
        })

        plusDayBtn.addEventListener("click", async (e) => {
            game.time.advance(86400)
        })

        plusMonthBtn.addEventListener("click", async (e) => {
            const d = new Date(game.time.worldTime * 1000)
            game.time.set((d.setMonth(d.getMonth() + 1) / 1000))
        })
    }
}

function createBtn(iconClass: string) {
    return foundry.utils.parseHTML(
        `<button type="button" class="icon fa-solid ${iconClass}"></button>`
    );
}
