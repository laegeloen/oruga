import { merge } from "./helpers"

let config = {
    iconPack: 'mdi',
    useHtml5Validation: true,
    statusIcon: true,
    defaultIconComponent: 'fa',
    defaultIconPack: 'fas',
    defaultLocale: 'da-DK',
    defaultDayNames: ['Sø', 'Ma', 'Ti', 'On', 'To', 'Fr', 'Lø'],
    defaultTooltipDelay: 400,
    defaultMonthNames: [
          'Januar',
          'Februar',
          'Marts',
          'April',
          'Maj',
          'Juni',
          'Juli',
          'August',
          'September',
          'Oktober',
          'November',
          'December'
        ],
    defaultFirstDayOfWeek: 1,
    defaultModalScroll: 'keep'
}

export const setOptions = (options) => { config = options }

export const getOptions = () => { return config }

export let VueInstance

export const setVueInstance = (Vue) => { VueInstance = Vue }

export const Programmatic = {
    getOptions,
    setOptions(options) {
        setOptions(merge(getOptions(), options, true))
    }
}

export const Plugin = {
    install(Vue, options = {}) {
        setVueInstance(Vue)
        // Options
        setOptions(merge(getOptions(), options, true))
    }
}
