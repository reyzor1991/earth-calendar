
[Wiki](https://github.com/reyzor1991/pf2e-wiki/wiki/Earth-Calendar)

Module use epoch time. It refers to the number of seconds that have elapsed since January 1, 1970, 00:00:00 Coordinated Universal Time (UTC)


<img width="305" height="191" alt="view" src="https://github.com/user-attachments/assets/88163424-415c-493a-a205-8a39d0719989" />

- set us/eu time format
- set time zone
- set epoch time
- add/minus
- - seconds
- - minutes
- - hours
- - days
- - months



Settings

<img width="777" height="260" alt="image" src="https://github.com/user-attachments/assets/3b426d80-f068-417f-8697-0f7f812f66a6" />

set format en-us/en-gb

set one of time zones, utc - default


Example of default json config

```json

{
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

```