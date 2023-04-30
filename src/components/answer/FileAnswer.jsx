import React, {useContext, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {Button, Form} from "react-bootstrap";
import {FormQuestionsContext} from "../../contexts/FormQuestionsContext.js";
import Constants from "../../constants/Constants.js";
import {v4 as uuidv4} from 'uuid';
import {BiTrash} from "react-icons/bi";


const FileAnswer = (props) => {
    const [fileID, setFileID] = useState(props.value);
    const [file, setFile] = useState(null);
    const context = useContext(FormQuestionsContext);
    const fileInputRef = useRef(null);

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

    function handleFileButtonClick() {
        fileInputRef.current.click();
    }
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

    useEffect(() => {
        const getFile = async () => {
            console.log(props.question[Constants.HAS_ANSWER]);
            if(context.getFile !== undefined){
                const fileTmp = await context.getFile(props.question[Constants.HAS_ANSWER]);
                console.log(fileTmp)
                if (fileTmp) {
                    setFile(fileTmp);
                }
            }
        }
        getFile()
    }, []);

    return(
        <React.Fragment>
            <Form.Group size={"small"} className={""}>

                <Form.Label>{props.label}</Form.Label>
                <Form.File id={`${props.question['@id']}-file-input`}
                    className="d-none"
                    label="Upload file"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    // accept=".pdf,.doc,.docx,.txt,.xlsx,.csv,image/*"
                />
            </Form.Group>
            <Button onClick={handleFileButtonClick}>Upload file</Button>
            {file && (
                <div className="mt-2">
                    <p>File: {fileID}</p>
                    <Button variant={"link"} onClick={handleFileRemove}>
                        <BiTrash color={"red"} style={{padding: 0}}></BiTrash>
                    </Button>
                </div>
            )}
        </React.Fragment>
    );

};

FileAnswer.propTypes = {
    question: PropTypes.object.isRequired,
    label: PropTypes.object.isRequired,
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default FileAnswer;