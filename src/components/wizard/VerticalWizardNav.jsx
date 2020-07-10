import React, { useContext } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import PropTypes from 'prop-types';
import JsonLdUtils from 'jsonld-utils';
import { ConfigurationContext } from '../../contexts/ConfigurationContext';
import FormUtils from '../../util/FormUtils';

const VerticalWizardNav = ({ steps, onNavigate, currentStep }) => {
  const { options } = useContext(ConfigurationContext);

  return (
    <div className="wizard-nav col-2 p-0 pr-2">
      <ListGroup>
        {steps.map((step, index) => (
          <ListGroupItem
            disabled={!FormUtils.isRelevant(step)}
            key={'nav' + index}
            onClick={() => onNavigate(index)}
            id={'wizard-nav-' + index}
            action={true}
            active={index === currentStep ? 'active' : ''}
            variant={'default'}
          >
            {JsonLdUtils.getLocalized(step[JsonLdUtils.RDFS_LABEL], options.intl)}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
};

VerticalWizardNav.propTypes = {
  currentStep: PropTypes.number.isRequired,
  steps: PropTypes.array.isRequired,
  onNavigate: PropTypes.func.isRequired
};

export default VerticalWizardNav;
