import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import WizardStep from './WizardStep';
import HorizontalWizardNav from './HorizontalWizardNav';
import VerticalWizardNav from './VerticalWizardNav';
import { ConfigurationContext } from '../../contexts/ConfigurationContext';
import WizardWindow from './WizardWindow';
import { WizardContext } from '../../contexts/WizardContext';
import * as Constants from '../../constants/Constants';

const findStepByQuestionId = (stepData, id) => {
  const findQuestionTraversal = (question, index) => {
    if (!question) {
      return -1;
    }

    if (question['@id'] === id) {
      return index;
    }

    let subQuestions = question[Constants.HAS_SUBQUESTION];

    if (!Array.isArray(subQuestions)) {
      subQuestions = [subQuestions];
    }

    return subQuestions.findIndex((q, index) => findQuestionTraversal(q, index) !== -1);
  };

  return stepData.findIndex((step, index) => findQuestionTraversal(step, index) !== -1);
};

const Wizard = () => {
  const wizardContext = React.useContext(WizardContext);
  const { options } = React.useContext(ConfigurationContext);

  let startingStep = 0;
  if (options.startingQuestionId) {
    startingStep = findStepByQuestionId(wizardContext.getStepData(), options.startingQuestionId);

    if (startingStep === -1) {
      console.warn(`Question with id ${options.startingQuestionId} not found!`);
      startingStep = 0;
    }
  } else if (options.startingStep) {
    startingStep = options.startingStep < wizardContext.getStepData().length ? options.startingStep : 0;
  }

  const [currentStep, setCurrentStep] = React.useState(startingStep);

  const [scrolledToStartingQuestionId, setScrolledToStartingQuestionId] = React.useState(false);

  useEffect(() => {
    if (options.startingQuestionId && !scrolledToStartingQuestionId) {
      const element = document.getElementById(options.startingQuestionId);
      if (element) {
        element.scrollIntoView();
        element.classList.add('text-danger');
        setScrolledToStartingQuestionId(true);
      }
    }
  });

  const onNextStep = () => {
    const stepData = wizardContext.getStepData();
    if (currentStep !== stepData.length - 1) {
      stepData[currentStep + 1].visited = true;
      setCurrentStep((prevCurrentStep) => prevCurrentStep + 1);
    }
  };

  const onPreviousStep = () => {
    if (currentStep === 0) {
      return;
    }
    setCurrentStep((prevCurrentStep) => prevCurrentStep - 1);
  };

  const navigate = (stepIndex) => {
    const stepData = wizardContext.getStepData();

    if (stepIndex === currentStep || stepIndex >= stepData.length) {
      return;
    }
    // Can we jump forward?
    if (stepIndex > currentStep && !stepData[stepIndex].visited && !options.enableForwardSkip) {
      return;
    }
    setCurrentStep(stepIndex);
  };

  const renderNav = () => {
    if (wizardContext.getStepData().length <= 1) {
      return null;
    }

    const stepData = wizardContext.getStepData();

    return options.horizontalWizardNav ? (
      <HorizontalWizardNav currentStep={currentStep} steps={stepData} onNavigate={navigate} />
    ) : (
      <VerticalWizardNav currentStep={currentStep} steps={stepData} onNavigate={navigate} />
    );
  };

  const renderWizard = () => {
    const isHorizontal = options.horizontalWizardNav;

    const cardClassname = isHorizontal ? '' : 'flex-row p-2';
    const containerClassname = isHorizontal ? 'card-body' : 'col-10 p-0';

    return (
      <Card className={cardClassname}>
        {renderNav()}
        <div className={containerClassname}>{initComponent()}</div>
      </Card>
    );
  };

  const initComponent = () => {
    const stepData = wizardContext.getStepData();

    if (stepData.length === 0) {
      return <div className="font-italic">There are no steps in this wizard.</div>;
    }

    const step = stepData[currentStep];

    return (
      <WizardStep
        key={'step' + currentStep}
        step={step}
        onNextStep={onNextStep}
        onPreviousStep={onPreviousStep}
        stepIndex={currentStep}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === wizardContext.getStepData().length - 1}
      />
    );
  };

  if (options.modalView) {
    return <WizardWindow>{renderWizard()}</WizardWindow>;
  }

  return renderWizard();
};

export default Wizard;
