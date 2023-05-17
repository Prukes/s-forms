import Constants from "../constants/Constants.js";
import { v4 as uuidv4 } from "uuid";

export default class Utils {
  /**
   * Calculates a simple hash of the specified string, much like usual Java implementations.
   * @param str The string to compute has for
   * @return {number}
   */
  static getStringHash(str) {
    let hash = 0;
    const strlen = str ? str.length : 0;

    if (strlen === 0) {
      return hash;
    }
    for (let i = 0; i < strlen; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
  }

  /**
   * Wraps passed object into new array if it is not array already.
   * @param object_or_array An object or array.
   * @returns {*} New array containing passed object or passed array.
   */
  static asArray(object_or_array) {
    if (!object_or_array) {
      return [];
    }
    if (object_or_array.constructor === Array) {
      return object_or_array;
    }
    return [object_or_array];
  }

  static findQuestionById(id, question, reflexive, asserted, transitive) {
    if (reflexive) {
      if (question["@id"] === id) {
        return question;
      }
    }

    const subQuestions = Utils.asArray(question[Constants.HAS_SUBQUESTION]); // we have such method in some kind of json-ld utils
    if (asserted) {
      for (let q of subQuestions) {
        let foundQ = Utils.findQuestionById(id, q, true, false, false);
        if (foundQ) return foundQ;
      }
    }

    if (transitive) {
      for (let q of subQuestions) {
        let foundQ = Utils.findQuestionById(id, q, false, true, true);
        if (foundQ) return foundQ;
      }
    }

    return null;
  }

  static findParent(root, question){
    const subquestions = Utils.asArray(root[Constants.HAS_SUBQUESTION]);

    if (subquestions.some((q) => q['@id'] === question['@id'])) {
      return root;
    } else {
      for (let subquestion of subquestions) {
        if(Array.isArray(subquestion[Constants.HAS_SUBQUESTION]) && subquestion[Constants.HAS_SUBQUESTION].length){
          const res = Utils.findParent(subquestion, question);
          if (res) return res;
        }
      }
    }
  }

  static copyNode(node, nameMap) {
    let newId = `${Constants.QUESTION}/${uuidv4()}-q`;
    let newOriginId = `${newId}-qo`; //append "qo" to question ID as the new question origin
    let oldId = node['@id'];

    node['@id'] = newId;
    node[Constants.HAS_QUESTION_ORIGIN] = newOriginId;
    node[Constants.IS_QUESTION_COPY] = true;
    nameMap[oldId] = newId;
    delete node[Constants.HAS_ANSWER];

    const subquestions = Utils.asArray(node[Constants.HAS_SUBQUESTION]);
    if(subquestions.length) {
      for (let sq of subquestions) {
        Utils.copyNode(sq, nameMap);
      }
    }
  }

  static renamePrecedingQuestionRelations(node, nameMap) {
    const prevName = node[Constants.HAS_PRECEDING_QUESTION];


    if(prevName){
      const newName = nameMap[prevName['@id']];
      node[Constants.HAS_PRECEDING_QUESTION] =  {'@id':newName};
    }

    const subquestions = Utils.asArray(node[Constants.HAS_SUBQUESTION]);
    if(subquestions.length) {
      for (let sq of subquestions) {
        Utils.renamePrecedingQuestionRelations(sq, nameMap);
      }
    }
  }
}
