import React, {useContext, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Button, Col, Container, Form, FormGroup, Row} from "react-bootstrap";
import {FormQuestionsContext} from "../../contexts/FormQuestionsContext.js";
import Constants from "../../constants/Constants.js";
import {v4 as uuidv4} from 'uuid';
import {BiTrash} from "react-icons/bi";


const FileAnswer = (props) => {
    const [fileID, setFileID] = useState(props.value);
    const [file, setFile] = useState(null);
    const context = useContext(FormQuestionsContext);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files && e.target.files[0];
        if (selectedFile) {
            const fileName = selectedFile.name;
            const type = selectedFile.type;
            const id = uuidv4();

            const reader = new FileReader();
            reader.onload = (event) => {
                const fileData = event.target?.result;
                if (fileData) {

                    const fileID = `${Constants.FILE_PREFIX}/${id}`;

                    setFileID(fileID);
                    setFile(fileData);
                    props.onChange(fileID);
                    if(context.onFileUpload !== undefined){
                        context.onFileUpload({fileName: fileName, type: type, id: fileID, data: fileData});
                    }
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleFileRemove = () => {
        const input = document.getElementById(`${props.question['@id']}-file-input`);
        input.value = "";
        props.onChange("");
        if(context.onFileDelete !== undefined){
            context.onFileDelete(file);
        }
        setFile(null);
        setFileID(null);

    }

    const init = useEffect(() => {
        const fileTmp = context.getFile(props.question[Constants.HAS_ANSWER]);
        if (fileTmp) {
            setFile(fileTmp);
        }
    }, []);

    return (
        <FormGroup size="small">
            <Form.Label>{props.label}</Form.Label>
            <input id={`${props.question['@id']}-file-input`} type="file" onChange={handleFileChange}/>
            {file &&
                <Container>
                    <Col className={"w-75"}>
                        {fileID && <p>Selected file: {fileID}</p>}
                    </Col>
                        <Col className={"w-25"}>
                            <Button variant={"link"} onClick={handleFileRemove}>
                                <BiTrash color={"red"} style={{padding: 0}}></BiTrash>
                            </Button>
                        </Col>
                </Container>
            }
        </FormGroup>
    );

};

FileAnswer.propTypes = {
    question: PropTypes.object.isRequired,
    label: PropTypes.object.isRequired,
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default FileAnswer;
