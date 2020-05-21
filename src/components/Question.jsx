import React from 'react';
import { Card, Accordion } from 'react-bootstrap';
import JsonLdUtils from 'jsonld-utils';
import PropTypes from 'prop-types';
import Answer from './Answer';
import Configuration from '../model/Configuration';
import * as Constants from '../constants/Constants';
import FormUtils from '../util/FormUtils';
import HelpIcon from './HelpIcon';
import JsonLdObjectMap from '../util/JsonLdObjectMap';
import QuestionAnswerProcessor from '../model/QuestionAnswerProcessor';
import ValidatorFactory from '../model/ValidatorFactory';
import JsonLdObjectUtils from '../util/JsonLdObjectUtils';
import PrefixIcon from './PrefixIcon';
import MediaContent from './MediaContent';
import { CaretSquareUp, CaretSquareDown, InfoCircle } from '../styles/icons';

// TODO Remove once the pretty layout is tested
const PRETTY_ANSWERABLE_LAYOUT = false;

export default class Question extends React.Component {
  constructor(props) {
    super(props);
    JsonLdObjectMap.putObject(props.question['@id'], props.question);
    this.state = {
      validator: ValidatorFactory.createValidator(props.question),
      expanded: !FormUtils.isCollapsed(props.question)
    };
  }

  onAnswerChange = (answerIndex, change) => {
    this._onChange(Constants.HAS_ANSWER, answerIndex, change);
  };

  onSubQuestionChange = (subQuestionIndex, change) => {
    this._onChange(Constants.HAS_SUBQUESTION, subQuestionIndex, change);
  };

  _onChange(att, valueIndex, newValue) {
    let newState = { ...this.props.question };
    newState[att][valueIndex] = newValue;
    if (att === Constants.HAS_ANSWER) {
      const result = this.state.validator(newValue);
      newState = { ...newState, ...result };
    }

    JsonLdObjectMap.putObject(newState['@id'], newState);
    this.props.onChange(this.props.index, newState);
  }

  _toggleCollapse = () => {
    if (this.props.collapsible) {
      this.setState({ expanded: !this.state.expanded });
    }
  };

  render() {
    const question = this.props.question;
    if (FormUtils.isHidden(question)) {
      return null;
    }
    if (!FormUtils.isRelevant(question)) {
      return null;
    }
    if (FormUtils.isAnswerable(question)) {
      if (PRETTY_ANSWERABLE_LAYOUT) {
        return (
          <div>
            <div className="panel-title answerable-question">{this.renderAnswers()}</div>
            <div className="answerable-subquestions">{this.renderSubQuestions()}</div>
          </div>
        );
      } else {
        return (
          <div>
            {this.renderAnswers()}
            <div className="ml-4 mt-n2">{this.renderSubQuestions()}</div>
          </div>
        );
      }
    }
    if (FormUtils.isSection(question)) {
      const { collapsible, withoutCard } = this.props;

      if (withoutCard) {
        return <div>{this._renderQuestionContent()}</div>;
      }
      const label = JsonLdUtils.getLocalized(question[JsonLdUtils.RDFS_LABEL], Configuration.intl);

      const cardBody = <Card.Body className="p-3">{this._renderQuestionContent()}</Card.Body>;

      const headerClassName = `bg-info text-white ${collapsible ? 'cursor-pointer' : ''}`.trim();

      // TODO change defaultActiveKey to label when expanded + add eventKey to Accordion.Collapse
      return (
        <Accordion defaultActiveKey={!this.state.expanded ? label : undefined}>
          <Card className="mb-3">
            <Accordion.Toggle as={Card.Header} onClick={this._toggleCollapse} className={headerClassName}>
              <h6 className="d-inline">
                {collapsible && this._renderCollapseToggle()}
                {label}
              </h6>
              {this._renderQuestionHelp()}
            </Accordion.Toggle>
            {collapsible ? <Accordion.Collapse>{cardBody}</Accordion.Collapse> : { cardBody }}
          </Card>
        </Accordion>
      );
    } else {
      return <div>{this._renderQuestionContent()}</div>;
    }
  }

  _renderQuestionContent() {
    let content = [];
    if (this.state.expanded) {
      content.push(<MediaContent key={this.props.question['@id'] + '-media'} question={this.props.question} />);
    }
    content.push(this.renderAnswers());
    content.push(this.renderSubQuestions());
    return content;
  }

  renderAnswers() {
    const question = this.props.question,
      children = [],
      answers = this._getAnswers();
    let row = [],
      cls,
      isTextarea;

    for (let i = 0, len = answers.length; i < len; i++) {
      isTextarea =
        FormUtils.isTextarea(this.props.question, FormUtils.resolveValue(answers[i])) ||
        FormUtils.isSparqlInput(question) ||
        FormUtils.isTurtleInput(question);
      cls = Question._getAnswerClass(isTextarea);
      row.push(
        <div key={'row-item-' + i} className={cls}>
          <div className="row">
            <div className="col-10">
              <Answer index={i} answer={answers[i]} question={question} onChange={this.onAnswerChange} />
            </div>
            <div>
              {this._renderUnits()}
              {this._renderQuestionHelp()}
              {this._renderPrefixes()}
            </div>
          </div>
        </div>
      );
      if (row.length === Constants.GENERATED_ROW_SIZE || isTextarea) {
        children.push(
          <div className="row" key={'question-row-' + i}>
            {row}
          </div>
        );
        row = [];
      }
    }
    if (row.length > 0) {
      children.push(
        <div className="row" key={'question-row-' + i}>
          {row}
        </div>
      );
    }
    return children;
  }

  _getAnswers() {
    const question = this.props.question;
    if (!question[Constants.HAS_ANSWER]) {
      question[Constants.HAS_ANSWER] = [];
    }
    if (!Array.isArray(question[Constants.HAS_ANSWER])) {
      question[Constants.HAS_ANSWER] = [question[Constants.HAS_ANSWER]];
    }
    if (question[Constants.HAS_ANSWER].length === 0) {
      if ((FormUtils.isSection(question) && !FormUtils.isAnswerable(question)) || FormUtils.isWizardStep(question)) {
        question[Constants.HAS_ANSWER] = [];
      } else {
        question[Constants.HAS_ANSWER] = [QuestionAnswerProcessor.generateAnswer(question)];
      }
    }
    return question[Constants.HAS_ANSWER];
  }

  static _getAnswerClass(isTextarea) {
    return isTextarea
      ? 'col-12'
      : Constants.GENERATED_ROW_SIZE === 1
      ? 'col-6'
      : 'col-' + Constants.COLUMN_COUNT / Constants.GENERATED_ROW_SIZE;
  }

  _renderCollapseToggle() {
    const title = this.state.expanded ? 'Collapse' : 'Expand';

    return (
      <span onClick={this._toggleCollapse} title={title}>
        {this.state.expanded ? <CaretSquareUp /> : <CaretSquareDown />}
      </span>
    );
  }

  _renderQuestionHelp() {
    const question = this.props.question;
    let helpClass = FormUtils.isCheckbox(question) ? 'help-icon-checkbox' : 'help-icon-text-input';
    if (FormUtils.isSection(question)) {
      helpClass = 'help-icon-section';
    }
    return question[Constants.HELP_DESCRIPTION] ? (
      <HelpIcon
        text={JsonLdUtils.getLocalized(question[Constants.HELP_DESCRIPTION], Configuration.intl)}
        iconClassContainer={helpClass}
      />
    ) : null;
  }

  _renderPrefixes() {
    const question = this.props.question;
    return question[Constants.HAS_DECLARED_PREFIX] && question[Constants.HAS_DECLARED_PREFIX].length ? (
      <PrefixIcon prefixes={question[Constants.HAS_DECLARED_PREFIX]} iconClass={'help-icon-checkbox'}>
        <InfoCircle />
      </PrefixIcon>
    ) : null;
  }

  _renderUnits() {
    const question = this.props.question;
    return question[Constants.HAS_UNIT] ? <div className="has-unit-label">{question[Constants.HAS_UNIT]}</div> : null;
  }

  renderSubQuestions() {
    const children = [];
    const subQuestions = this._getSubQuestions();

    for (let i = 0; i < subQuestions.length; i++) {
      children.push(
        <Question key={'sub-question-' + i} index={i} question={subQuestions[i]} onChange={this.onSubQuestionChange} />
      );
    }
    return children;
  }

  _getSubQuestions() {
    const question = this.props.question;
    if (!question[Constants.HAS_SUBQUESTION]) {
      question[Constants.HAS_SUBQUESTION] = [];
    }
    if (!Array.isArray(question[Constants.HAS_SUBQUESTION])) {
      question[Constants.HAS_SUBQUESTION] = [question[Constants.HAS_SUBQUESTION]];
    }

    // sort by label
    question[Constants.HAS_SUBQUESTION].sort(JsonLdObjectUtils.getCompareLocalizedLabelFunction(Configuration.intl));

    // sort by property
    JsonLdObjectUtils.orderPreservingToplogicalSort(
      question[Constants.HAS_SUBQUESTION],
      Constants.HAS_PRECEDING_QUESTION
    );

    return question[Constants.HAS_SUBQUESTION];
  }
}

Question.propTypes = {
  question: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number,
  withoutCard: PropTypes.bool,
  collapsible: PropTypes.bool // Whether the section is collapsible (if the question is a section)
};

Question.defaultProps = {
  withoutCard: false,
  collapsible: true
};
