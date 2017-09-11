'use strict';

import React from 'react';
import JsonLdUtils from 'jsonld-utils';

import Configuration from '../../model/Configuration';
import Constants from '../../constants/Constants';
import FormUtils from '../../util/FormUtils';

export default class SelectAnswer extends React.Component {
    static propTypes = {
        question: React.PropTypes.object.isRequired,
        label: React.PropTypes.string.isRequired,
        title: React.PropTypes.string,
        value: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    _generateSelectOptions(options) {
        const rendered = [];
        options.sort(function (a, b) {
            const aLabel = JsonLdUtils.getJsonAttValue(a, JsonldUtils.RDFS_LABEL),
                bLabel = JsonLdUtils.getJsonAttValue(b, JsonldUtils.RDFS_LABEL);
            if (aLabel < bLabel) {
                return -1;
            }
            if (aLabel > bLabel) {
                return 1;
            }
            return 0;
        });
        for (let i = 0, len = options.length; i < len; i++) {
            rendered.push(<option value={JsonLdUtils.getJsonAttValue(options[i], JsonldUtils.RDFS_LABEL)}
                                  key={'opt-' + i}>{JsonLdUtils.getJsonAttValue(options[i], JsonldUtils.RDFS_LABEL)}</option>);
        }
        return rendered;
    }

    render() {
        const question = this.props.question;
        return React.createElement(Configuration.inputComponent, {
                type: 'select',
                label: this.props.label,
                value: this.props.value,
                title: this.props.title,
                onChange: (e) => {this.props.onChange(e.target.value)},
                disabled: FormUtils.isDisabled(question)
            }, this._generateSelectOptions(question[Constants.HAS_OPTION])
        );
    }
}
