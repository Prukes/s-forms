import React, {useContext, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {Button, ButtonGroup, Form} from "react-bootstrap";
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
                    setFile({fileName: fileName, type: type, id: fileID, data: fileData});
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

    const getButtonName = () => {
        return !file ? "Upload file" : "Change file";
    }

    return(
            <Form.Group size={"small"}>
                <Form.Label className={"w-100"}>{props.label}</Form.Label>
                <Form.File id={`${props.question['@id']}-file-input`}
                    className="d-none"
                    label="Upload file"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*, audio/*, video/*"
                />
                <div>
                    <ButtonGroup>
                        <Button onClick={handleFileButtonClick}> {getButtonName()}</Button>
                        {file &&<Button variant={"link"} onClick={handleFileRemove}>
                            <BiTrash color={"red"} style={{padding: 0}}></BiTrash>
                        </Button>}
                    </ButtonGroup>

                    {file && (
                        <div className="mt-2">
                            {file.fileName && <p className={"text-wrap"}>File name: {file.fileName}</p>}
                            <p className={"text-wrap"}>FileID: {fileID}</p>
                        </div>
                    )}
                </div>
            </Form.Group>


    );

};

FileAnswer.propTypes = {
    question: PropTypes.object.isRequired,
    label: PropTypes.object.isRequired,
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default FileAnswer;
