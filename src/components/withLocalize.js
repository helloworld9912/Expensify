import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from '../libs/Localize';
import DateUtils from '../libs/DateUtils';
import * as LocalePhoneNumber from '../libs/LocalePhoneNumber';
import * as NumberFormatUtils from '../libs/NumberFormatUtils';
import * as LocaleDigitUtils from '../libs/LocaleDigitUtils';
import CONST from '../CONST';

const LocaleContext = createContext(null);

const withLocalizePropTypes = {
    /** Formats number formatted according to locale and options */
    numberFormat: PropTypes.func.isRequired,

    /** Converts a timestamp into a localized string representation that's relative to current moment in time */
    timestampToRelative: PropTypes.func.isRequired,

    /** Formats a timestamp to local date and time string */
    timestampToDateTime: PropTypes.func.isRequired,

    /** Returns a locally converted phone number without the country code */
    toLocalPhone: PropTypes.func.isRequired,

    /** Returns an internationally converted phone number with the country code */
    fromLocalPhone: PropTypes.func.isRequired,

    /** Gets the standard digit corresponding to a locale digit */
    fromLocaleDigit: PropTypes.func.isRequired,

    /** Gets the locale digit corresponding to a standard digit */
    toLocaleDigit: PropTypes.func.isRequired,

    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
};

const localeProviderPropTypes = {
    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale: PropTypes.string,

    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

const localeProviderDefaultProps = {
    preferredLocale: CONST.DEFAULT_LOCALE,
};

class LocaleContextProvider extends React.Component {
    /**
     * The context this component exposes to child components
     * @returns {object} translation util functions and locale
     */
    getContextValue() {
        return {
            translate: this.translate.bind(this),
            numberFormat: this.numberFormat.bind(this),
            timestampToRelative: this.timestampToRelative.bind(this),
            timestampToDateTime: this.timestampToDateTime.bind(this),
            fromLocalPhone: this.fromLocalPhone.bind(this),
            toLocalPhone: this.toLocalPhone.bind(this),
            fromLocaleDigit: this.fromLocaleDigit.bind(this),
            toLocaleDigit: this.toLocaleDigit.bind(this),
            preferredLocale: this.props.preferredLocale,
        };
    }

    /**
     * @param {String} phrase
     * @param {Object} [variables]
     * @returns {String}
     */
    translate(phrase, variables) {
        return Localize.translate(this.props.preferredLocale, phrase, variables);
    }

    /**
     * @param {Number} number
     * @param {Intl.NumberFormatOptions} options
     * @returns {String}
     */
    numberFormat(number, options) {
        return NumberFormatUtils.format(this.props.preferredLocale, number, options);
    }

    /**
     * @param {Number} timestamp
     * @returns {String}
     */
    timestampToRelative(timestamp) {
        return DateUtils.timestampToRelative(this.props.preferredLocale, timestamp);
    }

    /**
     * @param {Number} timestamp
     * @param {Boolean} [includeTimezone]
     * @returns {String}
     */
    timestampToDateTime(timestamp, includeTimezone) {
        return DateUtils.timestampToDateTime(
            this.props.preferredLocale,
            timestamp,
            includeTimezone,
        );
    }

    /**
     * @param {Number} number
     * @returns {String}
     */
    toLocalPhone(number) {
        return LocalePhoneNumber.toLocalPhone(this.props.preferredLocale, number);
    }

    /**
     * @param {Number} number
     * @returns {String}
     */
    fromLocalPhone(number) {
        return LocalePhoneNumber.fromLocalPhone(this.props.preferredLocale, number);
    }

    /**
     * @param {String} digit
     * @returns {String}
     */
    toLocaleDigit(digit) {
        return LocaleDigitUtils.toLocaleDigit(this.props.preferredLocale, digit);
    }

    /**
     * @param {String} localeDigit
     * @returns {String}
     */
    fromLocaleDigit(localeDigit) {
        return LocaleDigitUtils.fromLocaleDigit(this.props.preferredLocale, localeDigit);
    }

    render() {
        return (
            <LocaleContext.Provider value={this.getContextValue()}>
                {this.props.children}
            </LocaleContext.Provider>
        );
    }
}

LocaleContextProvider.propTypes = localeProviderPropTypes;
LocaleContextProvider.defaultProps = localeProviderDefaultProps;

const Provider = withOnyx({
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(LocaleContextProvider);

Provider.displayName = 'withOnyx(LocaleContextProvider)';

export default function withLocalize(WrappedComponent) {
    const WithLocalize = forwardRef((props, ref) => (
        <LocaleContext.Consumer>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            {translateUtils => <WrappedComponent {...translateUtils} {...props} ref={ref} />}
        </LocaleContext.Consumer>
    ));

    WithLocalize.displayName = `withLocalize(${getComponentDisplayName(WrappedComponent)})`;

    return WithLocalize;
}

export {
    withLocalizePropTypes,
    Provider as LocaleContextProvider,
};
