/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { MixType } from 'Type/Common';
import { PriceType } from 'Type/ProductList';
import {
    calculateFinalPrice,
    formatPrice,
    roundPrice
} from 'Util/Price';
import { BUNDLE } from 'Util/Product';

import ProductPrice from './ProductPrice.component';
import {
    DISPLAY_PRODUCT_PRICES_IN_CATALOG_BOTH,
    DISPLAY_PRODUCT_PRICES_IN_CATALOG_EXCL_TAX,
    DISPLAY_PRODUCT_PRICES_IN_CATALOG_INCL_TAX
} from './ProductPrice.config';

/** @namespace Component/ProductPrice/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    displayTaxInPrice: state.ConfigReducer.priceTaxDisplay?.product_price_display_type
});

/** @namespace Component/ProductPrice/Container/mapDispatchToProps */
// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({});

/**
 * Product price
 * @class ProductPrice
 * @namespace Component/ProductPrice/Container
 */
export class ProductPriceContainer extends PureComponent {
    static propTypes = {
        isSchemaRequired: PropTypes.bool,
        price: PriceType,
        mix: MixType,
        displayTaxInPrice: PropTypes.string,
        product: PropTypes.object.isRequired
    };

    static defaultProps = {
        isSchemaRequired: false,
        displayTaxInPrice: DISPLAY_PRODUCT_PRICES_IN_CATALOG_INCL_TAX,
        mix: {},
        price: {}
    };

    containerProps = () => {
        const {
            price: {
                minimum_price: {
                    discount: {
                        percent_off: discountPercentage
                    } = {},
                    final_price: {
                        value: minimalPriceValue,
                        currency: priceCurrency
                    } = {},
                    regular_price: {
                        value: regularPriceValue
                    } = {},
                    base_price: {
                        value: basePriceValue
                    } = {}
                } = {}
            } = {}
        } = this.props;

        if ((!minimalPriceValue || !regularPriceValue) && !basePriceValue) {
            return {};
        }

        const roundedRegularPrice = this.getRoundedRegularPrice();
        const formattedFinalPrice = this.getFormattedFinalPrice();
        const formattedSubPrice = this.getFormattedSubPrice();

        return {
            roundedRegularPrice,
            priceCurrency,
            discountPercentage,
            formattedFinalPrice,
            formattedSubPrice
        };
    };

    getRoundedRegularPrice() {
        const {
            price: {
                minimum_price: {
                    regular_price: {
                        value: regularPriceValue
                    } = {},
                    regular_price_excl_tax: {
                        value: regularPriceExclTaxValue
                    } = {},
                    base_price: {
                        value: basePriceValue
                    } = {}
                } = {}
            } = {},
            product: {
                type_id: productType,
                dynamic_price: isDynamicPrice
            } = {},
            displayTaxInPrice
        } = this.props;

        if (productType === BUNDLE && isDynamicPrice === false) {
            return roundPrice(basePriceValue);
        }

        if (displayTaxInPrice === DISPLAY_PRODUCT_PRICES_IN_CATALOG_EXCL_TAX) {
            return roundPrice(regularPriceExclTaxValue);
        }

        return roundPrice(regularPriceValue);
    }

    getFormattedFinalPrice() {
        const {
            price: {
                minimum_price: {
                    discount: {
                        percent_off: discountPercentage
                    } = {},
                    final_price: {
                        value: minimalPriceValue,
                        currency: priceCurrency
                    } = {},
                    final_price_excl_tax: {
                        value: minimalPriceExclTaxValue
                    } = {},
                    regular_price: {
                        value: regularPriceValue
                    } = {},
                    regular_price_excl_tax: {
                        value: regularPriceExclTaxValue
                    } = {},
                    base_price: {
                        value: basePriceValue
                    } = {},
                    base_final_price: {
                        value: baseFinalPriceValue
                    } = {}
                } = {}
            } = {},
            displayTaxInPrice,
            product: {
                type_id: productType,
                dynamic_price: isDynamicPrice
            } = {}
        } = this.props;

        if (productType === BUNDLE && isDynamicPrice === false) {
            const finalPrice = calculateFinalPrice(
                discountPercentage,
                baseFinalPriceValue,
                basePriceValue
            );

            return formatPrice(finalPrice, priceCurrency);
        }

        if (displayTaxInPrice === DISPLAY_PRODUCT_PRICES_IN_CATALOG_EXCL_TAX) {
            const finalPrice = calculateFinalPrice(
                discountPercentage,
                minimalPriceExclTaxValue,
                regularPriceExclTaxValue
            );

            return formatPrice(finalPrice, priceCurrency);
        }

        const finalPrice = calculateFinalPrice(discountPercentage, minimalPriceValue, regularPriceValue);

        return formatPrice(finalPrice, priceCurrency);
    }

    getFormattedSubPrice() {
        const {
            price: {
                minimum_price: {
                    discount: {
                        percent_off: discountPercentage
                    } = {},
                    final_price_excl_tax: {
                        value: minimalPriceExclTaxValue,
                        currency: priceCurrency
                    } = {},
                    regular_price_excl_tax: {
                        value: regularPriceExclTaxValue
                    } = {},
                    base_final_price_excl_tax: {
                        value: baseFinalPriceExclTaxValue
                    } = {}
                } = {}
            } = {},
            displayTaxInPrice,
            product: {
                type_id: productType,
                dynamic_price: isDynamicPrice
            } = {}
        } = this.props;

        if (displayTaxInPrice === DISPLAY_PRODUCT_PRICES_IN_CATALOG_BOTH) {
            if (productType === BUNDLE && isDynamicPrice === false) {
                return formatPrice(baseFinalPriceExclTaxValue, priceCurrency);
            }

            const finalPrice = calculateFinalPrice(
                discountPercentage,
                minimalPriceExclTaxValue,
                regularPriceExclTaxValue
            );

            return formatPrice(finalPrice, priceCurrency);
        }

        return null;
    }

    render() {
        return (
            <ProductPrice
              { ...this.props }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductPriceContainer);
