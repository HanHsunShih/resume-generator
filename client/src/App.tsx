// import { useState } from "react";
import "./App.scss";
import axios from "axios";
import docImg from "./assets/images/doc.png";
// import { getOpenAIResponse } from "../utils/apiUtils";
import { useEffect, useRef, useState } from "react";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
// @ts-ignore
import "pdfjs-dist/legacy/build/pdf.worker";

function App() {
  const [result, setResult] = useState("");
  const jdInput = useRef<HTMLTextAreaElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);
  const [jdErrorMessage, setJdErrorMessage] = useState("");
  const [cvErrorMessage, setCvErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const apiUrl = import.meta.env.VITE_SERVER_URL;

  const handleJdOnChange = () => {
    setJdErrorMessage("");
  };

  const GetPdfContent = async (
    src:
      | string
      | Uint8Array
      | ArrayBuffer
      | pdfjsLib.PDFDataRangeTransport
      | pdfjsLib.DocumentInitParameters
  ) => {
    const doc = await pdfjsLib.getDocument(src).promise;
    const page = await doc.getPage(1);
    return await page.getTextContent();
  };

  const getPdfItem = async (
    src:
      | string
      | Uint8Array
      | ArrayBuffer
      | pdfjsLib.PDFDataRangeTransport
      | pdfjsLib.DocumentInitParameters
  ) => {
    const content = await GetPdfContent(src);
    const items = content.items.map((item: pdfjsLib.TextItem) => {
      // console.log("item.str: ");
      console.log(item.str);
      return item.str;
    });

    return items;
  };

  const readFileAsText = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const extractedText = await getPdfItem(arrayBuffer);
        resolve(extractedText);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      let hasError = false;

      if (!jdInput.current?.value.trim()) {
        setJdErrorMessage("Please paste job description");
        hasError = true;
      }

      const file = cvInput.current?.files?.[0];
      if (!file) {
        setCvErrorMessage("Please upload your resume as a PDF file");
        hasError = true;
      }

      if (hasError) return;

      const cvResponse = await readFileAsText(file!);
      const extractText = cvResponse.join("");

      const response = await axios.post(`${apiUrl}/openai`, {
        jobDescription: jdInput.current?.value,
        cvContent: extractText,
      });

      setResult(response.data.content);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      setCvErrorMessage("");
    }
  };

  return (
    <>
      <div className="container">
        <header className="header">
          <h1 className="header__title">Resume Generator</h1>
        </header>
        <form action="" className="form" onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label htmlFor="jd" className="form-group__label">
              Paste Job Description
            </label>
            <textarea
              name="jd"
              rows={8}
              cols={50}
              className="form-group__input"
              placeholder="Paste Job Description here..."
              ref={jdInput}
              onChange={handleJdOnChange}
            />
            <p className="form__error-message">{jdErrorMessage || "\u00A0"}</p>

            {/* {jdErrorMessage && (
              <p className="form__error-message">{jdErrorMessage}</p>
            )} */}
            <label htmlFor="resumeSubmitted" className="form-group__label">
              Choose your CV from device
            </label>
            <label htmlFor="resumeSubmitted" className="form-group__file-label">
              {fileName ? `Change File` : `Choose file`}
            </label>
            {!fileName ? (
              <p className="form__error-message">
                {cvErrorMessage || "\u00A0"}
              </p>
            ) : (
              <p className="form__file-name">{fileName}</p>
            )}
            {/* {cvErrorMessage && (
              <p className="form__error-message">{cvErrorMessage}</p>
            )} */}
            {/* <p>{fileName ? `` : `${fileName}`}</p> */}
            {/* {fileName && <p className="form__file-name">{fileName}</p>} */}
            <input
              type="file"
              name="resumeSubmitted"
              id="resumeSubmitted"
              className="form-group__file-input"
              accept="application/pdf"
              onChange={handleSelectedFile}
              ref={cvInput}
            />
            <button type="submit" className="form-group__button">
              Generate
            </button>
          </div>
        </form>

        <div className="download-section">
          {result && <p>{result}</p>}
          <h3>Download Word File</h3>
          <img
            src={docImg}
            alt="word file image"
            className="download-section__img"
          />
          {/* <div className="download-icon"></div> */}
        </div>
      </div>
    </>
  );
}

export default App;
