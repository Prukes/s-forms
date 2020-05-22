import React from 'react';
import ReactDOM from 'react-dom';
import WizardGenerator from '../../src/model/WizardGenerator';
import SForms from '../../src/components/SForms';

import '../../src/styles/s-forms.css';

const form = require('./form.json');

class TestApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wizardProperties: null,
      wizard: null,
      isFormValid: false
    };
    this.form = React.createRef();
  }

  fetchTypeAheadValues = (query) => {
    const possibleValues = require('./possibleValues.json');
    return new Promise((resolve) => setTimeout(() => resolve(possibleValues), 1500));
  };

  async componentDidMount() {
    const intl = {
      locale: 'cs'
    };

    const [wizardProperties, structure] = await WizardGenerator.createWizard(form, null, null, intl);
    this.setState({ wizardProperties, form: structure });
  }

  render() {
    if (!this.state.wizardProperties) {
      return <div>'Loading wizard...'</div>;
    }

    const modalProps = {
      onHide: () => {},
      show: true,
      title: 'Title'
    };

    return (
      <React.Fragment>
        <SForms
          ref={this.form}
          steps={this.state.wizardProperties.steps}
          data={this.state.form}
          enableForwardSkip={true}
          horizontalWizardNav={true}
          modalView={false}
          modalProps={modalProps}
          fetchTypeAheadValues={this.fetchTypeAheadValues}
          isFormValid={(isFormValid) => this.setState({ isFormValid })}
          options={{
            i18n: {
              'wizard.next': 'Next',
              'wizard.previous': 'Previous'
            },
            intl: {
              locale: 'cs'
            }
          }}
        />
        <button
          disabled={!this.state.isFormValid}
          style={{ width: '100px', margin: '1rem -50px', position: 'relative', left: '50%' }}
          onClick={() => console.log(this.form.current.getFormData())}
        >
          Save
        </button>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<TestApp />, document.getElementById('container'));
