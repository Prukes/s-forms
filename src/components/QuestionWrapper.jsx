import {Button, ButtonToolbar} from "react-bootstrap";
import {BiDuplicate, BiTrash} from "react-icons/bi";
import React, {useContext} from "react";
import FormUtils from "../util/FormUtils.js";
import {ConfigurationContext} from "../contexts/ConfigurationContext.js";
import Question from "./Question.jsx";
import Constants from "../constants/Constants.js";
const QuestionWrapper = (props) => {
    const context = useContext(ConfigurationContext);
    const _isDuplicable = () => {
        //guard clause for section
        if( FormUtils.isWizardStep(props.question) ) return false;

        if(FormUtils.isFileUpload(props.question)) return true;
        if(FormUtils.isSection(props.question)) return true;
        if(FormUtils.isCalendar(props.question)) return true;
        if(FormUtils.isCheckbox(props.question)) return true;
        if(FormUtils.isDate(props.question)) return true;
        if(FormUtils.isTime(props.question)) return true;
        if(FormUtils.isDateTime(props.question)) return true;
        if(FormUtils.isMaskedInput(props.question)) return true;
        if(FormUtils.isTextarea(props.question)) return true;
        if(FormUtils.isText(props.question)) return true;
        if(FormUtils.isTypeahead(props.question)) return true;
        if(FormUtils.isSparqlInput(props.question)) return true;
        if(FormUtils.getCategory(props.question)) return true;

        //default to false for any other question types
        return false;
    }

    const _isCopy = () => {
        const value = props.question[Constants.IS_QUESTION_COPY];
        return !!value;
    }

    const _getColor = () => {
        if(FormUtils.isSection(props.question))
            return 'black';

    }

    const _getTopOffset = () => {
        if(FormUtils.isSection(props.question))
            return '10px';
        return 0;
    }

    return(
        <React.Fragment>
                <div className={"wrapper-container"}>
                    <ButtonToolbar>
                        {/*{_isCopy() && (*/}
                        {/*    <div  className={"wrapper-button"} style={{ top:_getTopOffset(), right:"10px"}}>*/}
                        {/*        <Button id={props.question['@id']+'-remove-button'} style={{padding:0}} variant={"link"} onClick={() => {props.deleteQuestion(props.question)}}>*/}
                        {/*            <BiTrash color={"red"}/>*/}
                        {/*        </Button>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                        {_isDuplicable() && (
                            <div  className={"wrapper-button"} style={{ top:_getTopOffset(), right:'10px'}}>
                                <Button id={props.question['@id']+'-duplication-button'} style={{padding:0}} variant={"link"} onClick={() => {props.cloneQuestion(props.question)}}>
                                    <BiDuplicate color={_getColor()}/>
                                </Button>
                            </div>
                        )}
                    </ButtonToolbar>
                </div>
            {/*<div className={"duplication-container"}>*/}
            {/*    {*/}
            {/*        _isDuplicable() ?*/}
            {/*            <div  className={"duplication-button"} style={{ top:_getTopOffset()}}>*/}
            {/*                <Button id={props.question['@id']+'-duplication-button'} style={{padding:0}} variant={"link"} onClick={() => {props.cloneQuestion(props.question)}}>*/}
            {/*                    <BiDuplicate color={_getColor()}/>*/}
            {/*                </Button>*/}
            {/*            </div> : null*/}
            {/*    }*/}
            {/*</div>*/}

            <Question {...props}></Question>
        </React.Fragment>

    );
}

export default QuestionWrapper;