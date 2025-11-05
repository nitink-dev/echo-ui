import renderer from 'react-test-renderer';
import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { SlideScannerListView } from "./components/SlideScannerListView";
import { SlideScannerForm } from "./components/SlideScannerForm";
import { ScannerDetailsView } from "./components/ScannerDetailsView";
import { QAAnalysisConfig } from "./components/QAAnalysisConfig";
import { DataStoreConfig } from "./components/DataStoreConfig";
import { ClinicalAppsConfig } from "./components/ClinicalAppsConfig";
import { Toaster } from "./components/ui/sonner";
import axios from "axios";
import {BASE_URL} from "./util/util"
import App from "./App";

jest.mock("./components/Layout");
jest.mock("./components/SlideScannerListView");
jest.mock("./components/SlideScannerForm");
jest.mock("./components/ScannerDetailsView");
jest.mock("./components/QAAnalysisConfig");
jest.mock("./components/DataStoreConfig");
jest.mock("./components/ClinicalAppsConfig");
jest.mock("./components/ui/sonner");
jest.mock("axios");
jest.mock("./util/util");

const renderTree = tree => renderer.create(tree);
describe('<App>', () => {
  it('should render component', () => {
    expect(renderTree(<App 
    />).toJSON()).toMatchSnapshot();
  });
  
});