<template>
    <div :class="rootClasses">
        <div
            :class="containerClasses"
            @click="hasInput && focus($event)">
            <slot name="selected" :items="items">
                <span
                    v-for="(item, index) in items"
                    :key="getNormalizedItemText(item) + index"
                    :class="itemClasses"
                >
                    <span>{{ getNormalizedItemText(item) }}</span>
                    <o-icon
                        v-if="closable"
                        :class="closeClasses"
                        clickable
                        both
                        :icon="closeIcon"
                        @click="removeItem(index, $event)"
                        :aria-label="ariaCloseLabel"
                    />
                </span>
            </slot>

            <o-autocomplete
                ref="autocomplete"
                v-if="hasInput"
                v-model="newItem"
                v-bind="autocompleteBind"
                :data="data"
                :field="field"
                :icon="icon"
                :icon-pack="iconPack"
                :maxlength="maxlength"
                :has-counter="false"
                :size="size"
                :disabled="disabled"
                :autocomplete="nativeAutocomplete"
                :open-on-focus="openOnFocus"
                :keep-first="keepFirst"
                :keep-open="openOnFocus"
                :group-field="groupField"
                :group-options="groupOptions"
                :use-html5-validation="useHtml5Validation"
                :check-infinite-scroll="checkInfiniteScroll"
                :append-to-body="appendToBody"
                :confirm-keys="confirmKeys"
                @typing="onTyping"
                @focus="onFocus"
                @blur="customOnBlur"
                @keydown="keydown"
                @compositionstart="isComposing = true"
                @compositionend="isComposing = false"
                @select="onSelect"
                @infinite-scroll="$emit('infinite-scroll', $event)"
                @icon-right-click="$emit('icon-right-click', $event)">
                <template
                    v-if="hasHeaderSlot"
                    #header>
                    <slot name="header" />
                </template>
                <template
                    v-if="hasDefaultSlot"
                    #default="props">
                    <slot
                        :option="props.option"
                        :index="props.index" />
                </template>
                <template
                    v-if="hasEmptySlot"
                    #empty>
                    <slot name="empty" />
                </template>
                <template
                    v-if="hasFooterSlot"
                    #footer>
                    <slot name="footer" />
                </template>
            </o-autocomplete>
        </div>

        <small
            v-if="hasCounter && (maxitems || maxlength)"
            :class="counterClasses">
            <template v-if="maxlength && valueLength > 0">
                {{ valueLength }} / {{ maxlength }}
            </template>
            <template v-else-if="maxitems">
                {{ itemsLength }} / {{ maxitems }}
            </template>
        </small>
    </div>
</template>

<script lang="ts">
import Autocomplete from '../autocomplete/Autocomplete.vue'
import Icon from '../icon/Icon.vue'

import FormElementMixin from '../../utils/FormElementMixin'
import BaseComponentMixin from '../../utils/BaseComponentMixin'

import { getValueByPath } from '../../utils/helpers'
import { getOptions } from '../../utils/config'
import { defineComponent } from 'vue'

/**
 * A simple item input field that can have autocomplete functionality
 * @displayName Inputitems
 * @example ./examples/InputItems.md
 * @style _inputItems.scss
 */
export default defineComponent({
    name: 'OInputitems',
    components: {
        [Autocomplete.name]: Autocomplete,
        [Icon.name]: Icon
    },
    mixins: [FormElementMixin, BaseComponentMixin],
    inheritAttrs: false,
    configField: 'inputitems',
    emits: ['update:modelValue', 'focus', 'blur', 'add', 'remove', 'typing', 'infinite-scroll', 'icon-right-click'],
    props: {
        /** @model */
        modelValue: {
            type: Array,
            default: () => []
        },
        /**
         * Vertical size of input, optional
         * @values small, medium, large
         */
        size: String,
        /** Items data */
        data: {
            type: Array,
            default: () => []
        },
        /**
         * Color of the each items, optional
         * @values primary, info, success, warning, danger, and any other custom color
         */
        variant: String,
        /** Limits the number of items, plus item counter */
        maxitems: {
            type: [Number, String],
            required: false
        },
        /** Show counter when maxlength or maxtags props are passed */
        hasCounter: {
            type: Boolean,
            default: () => {
                return getValueByPath(getOptions(), 'inputitems.hasCounter', true)
            }
        },
        /** Property of the object (if data is array of objects) to use as display text */
        field: {
            type: String,
            default: 'value'
        },
        /** Add autocomplete feature (if true, any Autocomplete props may be used too) */
        autocomplete: Boolean,
        /**  Property of the object (if data is array of objects) to use as display text of group */
        groupField: String,
        /**  Property of the object (if data is array of objects) to use as key to get items array of each group, optional */
        groupOptions: String,
        nativeAutocomplete: String,
        /**  Opens a dropdown with choices when the input field is focused */
        openOnFocus: Boolean,
        /** Input will be disabled */
        disabled: Boolean,
        /** Add close/delete button to the item */
        closable: {
            type: Boolean,
            default: () => {
                return getValueByPath(getOptions(), 'inputitems.closable', true)
            }
        },
        /**
         * Array of keys
         * (https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
         * which will add a item when typing (default comma, tab and enter)
         */
        confirmKeys: {
            type: Array,
            default: () => {
                return getValueByPath(getOptions(), 'inputitems.confirmKeys', [',', 'Tab', 'Enter'])
            }
        },
        /** Allow removing last item when pressing given keys, if input is empty */
        removeOnKeys: {
            type: Array,
            default: () => {
                return getValueByPath(getOptions(), 'inputitems.removeOnKeys', ['Backspace'])
            }
        },
        /** When autocomplete, it allow to add new items */
        allowNew: Boolean,
        /** Array of chars used to split when pasting a new string */
        onPasteSeparators: {
            type: Array,
            default: () => {
                return getValueByPath(getOptions(), 'inputitems.onPasteSeparators', [','])
            }
        },
        /** Function to validate the value of the item before adding */
        beforeAdding: {
            type: Function,
            default: () => true
        },
        /** Allows adding the same item multiple time */
        allowDuplicates: {
            type: Boolean,
            default: false
        },
        /** Makes the autocomplete component check if list reached scroll end and emit infinite-scroll event */
        checkInfiniteScroll: {
            type: Boolean,
            default: false
        },
        /** Function to create a new item to push into v-model (items) */
        createItem: {
            type: Function,
            default: (item: any) => item
        },
        /** Icon name of close icon on selected item */
        closeIcon: {
            type: String,
            default: () => {
                return getValueByPath(getOptions(), 'inputitems.closeIcon', 'close')
            }
        },
        /** The first option will always be pre-selected (easier to just hit enter or tab) */
        keepFirst: Boolean,
        /** Accessibility label for the close button */
        ariaCloseLabel: String,
        /** Append autocomplete content to body */
        appendToBody: Boolean,
        rootClass: [String, Array, Function],
        expandedClass: [String, Array, Function],
        variantClass: [String, Array, Function],
        closeClass: [String, Array, Function],
        itemClass: [String, Array, Function],
        counterClass: [String, Array, Function],
        autocompleteClasses: {
            type: Object,
            default: () => {
                return getValueByPath(getOptions(), 'inputitems.autocompleteClasses', {})
            }
        }
    },
    data() {
        return {
            items: Array.isArray(this.modelValue) ? this.modelValue.slice(0) : (this.modelValue || []),
            newItem: '',
            isComposing: false
        }
    },
    computed: {
        rootClasses() {
            return [
                this.computedClass('rootClass', 'o-inputit'),
                { [this.computedClass('expandedClass', 'o-inputit--expanded')]: this.expanded }
            ]
        },

        containerClasses() {
            return [
                this.computedClass('containerClass', 'o-inputit__container'),
                { [this.computedClass('sizeClass', 'o-inputit__container--', this.size)]: this.size },
            ]
        },

        itemClasses() {
            return [
                this.computedClass('itemClass', 'o-inputit__item'),
                { [this.computedClass('variantClass', 'o-inputit__item--', this.variant)]: this.variant }
            ]
        },

        closeClasses() {
            return [
                this.computedClass('closeClass', 'o-inputit__item__close')
            ]
        },

        counterClasses() {
            return [
                this.computedClass('counterClass', 'o-inputit__counter')
            ]
        },

        autocompleteBind() {
            return {
                ...this.$attrs,
                'root-class': this.computedClass('autocompleteClasses.rootClass', 'o-inputit__autocomplete'),
                'input-classes': {
                    'input-class': this.computedClass('autocompleteClasses.inputClasses.inputClass', 'o-inputit__input'),
                },
                ...this.autocompleteClasses
            }
        },

        valueLength() {
            return this.newItem.trim().length
        },

        hasDefaultSlot() {
            return !!this.$slots.default
        },

        hasEmptySlot() {
            return !!this.$slots.empty
        },

        hasHeaderSlot() {
            return !!this.$slots.header
        },

        hasFooterSlot() {
            return !!this.$slots.footer
        },

        /**
         * Show the input field if a maxitems hasn't been set or reached.
         */
        hasInput() {
            return this.maxitems == null || this.itemsLength < this.maxitems
        },

        itemsLength() {
            return this.items.length
        },

        /**
         * If input has onPasteSeparators prop,
         * returning new RegExp used to split pasted string.
         */
        separatorsAsRegExp() {
            const sep = this.onPasteSeparators

            return sep.length ? new RegExp(sep.map((s) => {
                return s ? s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : null
            }).join('|'), 'g') : null
        },

        $elementRef() {
            return 'autocomplete'
        }
    },
    watch: {
        /**
         * When modelValue is changed set internal value.
         */
        modelValue(value) {
            this.items = Array.isArray(value) ? value.slice(0) : (value || [])
        },

        hasInput() {
            if (!this.hasInput) this.onBlur()
        }
    },
    methods: {
        addItem(item) {
            const itemToAdd = item || this.newItem.trim()

            if (itemToAdd) {
                if (!this.autocomplete) {
                    const reg = this.separatorsAsRegExp
                    if (reg && itemToAdd.match(reg)) {
                        itemToAdd.split(reg)
                            .map((t) => t.trim())
                            .filter((t) => t.length !== 0)
                            .map(this.addItem)
                        return
                    }
                }
                // Add the item input if it is not blank
                // or previously added (if not allowDuplicates).
                const add = !this.allowDuplicates ? this.items.indexOf(this.createItem(itemToAdd)) === -1 : true
                if (add && this.beforeAdding(itemToAdd)) {
                    this.items.push(this.createItem(itemToAdd))
                    this.$emit('update:modelValue', this.items)
                    this.$emit('add', itemToAdd)
                }
            }
            // after autocomplete events
            requestAnimationFrame(() => {
                this.newItem = ''
                this.$emit('typing', '')
            })
        },

        getNormalizedItemText(item) {
            if (typeof item === 'object') {
                item = getValueByPath(item, this.field)
            }

            return `${item}`
        },

        customOnBlur(event) {
            // Add item on-blur if not select only
            if (!this.autocomplete) this.addItem()

            this.onBlur(event)
        },

        onSelect(option) {
            if (!option) return

            this.addItem(option)
            this.$nextTick(() => {
                this.newItem = ''
            })
        },

        removeItem(index, event) {
            const item = this.items.splice(index, 1)[0]
            this.$emit('update:modelValue', this.items)
            this.$emit('remove', item)
            if (event) event.stopPropagation()
            if (this.openOnFocus && this.$refs.autocomplete) {
                this.$refs.autocomplete.focus()
            }
            return item
        },

        removeLastItem() {
            if (this.itemsLength > 0) {
                this.removeItem(this.itemsLength - 1)
            }
        },

        keydown(event) {
            const { key } = event // cannot destructure preventDefault (https://stackoverflow.com/a/49616808/2774496)
            if (this.removeOnKeys.indexOf(key) !== -1 && !this.newItem.length) {
                this.removeLastItem()
            }
            // Stop if is to accept select only
            if (this.autocomplete && !this.allowNew) return

            if (this.confirmKeys.indexOf(key) >= 0) {
                // Allow Tab to advance to next field regardless
                if (key !== 'Tab') event.preventDefault()
                if (key === 'Enter' && this.isComposing) return
                this.addItem()
            }
        },

        onTyping(event) {
            this.$emit('typing', event.trim())
        }
    }
})
</script>
