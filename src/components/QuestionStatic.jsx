import React from "react";
import Constants from "../constants/Constants.js";
import HelpIcon from "./HelpIcon.jsx";
import LinkIcon from "./LinkIcon.jsx";
import QuestionCommentIcon from "./comment/QuestionCommentIcon.jsx";
import JsonLdUtils from "jsonld-utils";
import FormUtils from "../util/FormUtils.js";
import {BiDuplicate} from "react-icons/bi";
import {Button} from "react-bootstrap";

export default class QuestionStatic {
  static isDuplicable(question){
      if (!question) return false;
    return !!FormUtils.isDuplicable(question);
  }
  static isCopy = (question) => {
    const value = question[Constants.IS_QUESTION_COPY];
    return !!value;
  }

  static getColor = (question) => {
    if (FormUtils.isSection(question))
      return 'black';
  }

  static renderIcons(question, options, onCommentChange, showIcon, cloneQuestion) {
    let icons;
    if (options.icons) icons = options.icons;
    else icons = Constants.DEFAULT_OPTIONS.icons;
    let iconsArray = [];
    const renderQuestionHelp = this.renderQuestionHelp(
      question,
      options,
      onCommentChange,
      showIcon
    );
    const renderQuestionComments = this.renderQuestionComments(
      question,
      options,
      onCommentChange,
      showIcon
    );

    const renderQuestionLink = this.renderQuestionLink(
      question,
      options,
      onCommentChange,
      showIcon
    );

    for (let i = 0; i < icons.length; i++) {
      if (icons[i].id === Constants.ICONS.QUESTION_COMMENTS) {
        iconsArray.push(
          <li key={i} className="icon-list-item">
            {renderQuestionComments}
          </li>
        );
      }
      if (icons[i].id === Constants.ICONS.QUESTION_HELP) {
        iconsArray.push(
          <li key={i} className="icon-list-item">
            {renderQuestionHelp}
          </li>
        );
      }
      if (icons[i].id === Constants.ICONS.QUESTION_LINK) {
        iconsArray.push(
          <li key={i} className="icon-list-item">
            {renderQuestionLink}
          </li>
        );
      }
    }
    if(this.isDuplicable(question)){
      iconsArray.push(
          <li key={`${question['@id']}-duplication-button`} className="icon-list-item">
            {this.getDuplicationIconButton(question, cloneQuestion)}
          </li>
      );
    }


    return <ol className="icon-list-items">{iconsArray}</ol>;
  }

  static renderQuestionHelp(question, options, onCommentChange, showIcon) {
    return this.getIconComponentFromName(
      Constants.ICONS.QUESTION_HELP,
      question,
      options,
      onCommentChange,
      showIcon
    );
  }

  static renderQuestionComments = (
    question,
    options,
    onCommentChange,
    showIcon
  ) => {
    return this.getIconComponentFromName(
      Constants.ICONS.QUESTION_COMMENTS,
      question,
      options,
      onCommentChange,
      showIcon
    );
  };

  static renderQuestionLink(question, options, onCommentChange, showIcon) {
    return this.getIconComponentFromName(
      Constants.ICONS.QUESTION_LINK,
      question,
      options,
      onCommentChange,
      showIcon
    );
  }

  static getIconComponentFromName(
    iconName,
    question,
    options,
    onCommentChange,
    showIcon
  ) {
    const iconList = options.icons
      ? options.icons
      : Constants.DEFAULT_OPTIONS.icons;
    const icon = this.getIconFromIconList(iconList, iconName);
    return this.getIconComponent(
      icon,
      question,
      options,
      onCommentChange,
      showIcon
    );
  }

  static getIconFromIconList = (iconList, iconName) => {
    if (iconList) return iconList.find((icon) => icon.id === iconName);
    return null;
  };

  static getDuplicationIconButton(question, cloneQuestion){
    return <div>
      <Button
          id={question["@id"]}
          style={{padding: 0, marginLeft: "10px"}}
          variant={"link"}
          onClick={() => {
            cloneQuestion(question);
          }}
      >
        <BiDuplicate color={this.getColor(question)}/>
      </Button>
    </div>;
  }

  static getIconComponent(icon, question, options, onCommentChange, showIcon) {
    let iconClassname;

    if (
      icon &&
      (icon.behavior === Constants.ICON_BEHAVIOR.ON_HOVER ||
        icon.behavior === Constants.ICON_BEHAVIOR.ENABLE)
    ) {
      if (icon.behavior === Constants.ICON_BEHAVIOR.ENABLE) {
        showIcon = true;
        iconClassname = "";
      } else iconClassname = "emphasise-on-relevant-icon";

      if (
        icon.id === Constants.ICONS.QUESTION_HELP &&
        question[Constants.HELP_DESCRIPTION]
      ) {
        if (showIcon) {
          return (
            <div className={iconClassname}>
              <HelpIcon
                text={JsonLdUtils.getLocalized(
                  question[Constants.HELP_DESCRIPTION],
                  options.intl
                )}
                absolutePosition={false}
              />
            </div>
          );
        }
        return null;
      }

      if (
        icon.id === Constants.ICONS.QUESTION_LINK &&
        question[Constants.SOURCE]
      ) {
        if (showIcon) {
          return (
            <div className={iconClassname}>
              <LinkIcon url={question[Constants.SOURCE]} />
            </div>
          );
        }
        return null;
      }

      if (icon.id === Constants.ICONS.QUESTION_COMMENTS) {
        if (showIcon) {
          return (
            <div className={iconClassname}>
              <QuestionCommentIcon
                question={question}
                onChange={onCommentChange}
              />
            </div>
          );
        }
        return null;
      }
      return null;
    }
  }
}
