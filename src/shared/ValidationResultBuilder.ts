import { ValidationResult } from "../types/ValidationResult";

export class ValidationResultBuilder {

  private valid: boolean;
  private errorMessage?: string;

  constructor() {
    this.valid = false;
  }

  public setValidity = (valid: boolean): ValidationResultBuilder => {
    this.valid = valid;
    return this;
  }

  public setErrorMessage = (errorMessage: string): ValidationResultBuilder => {
    this.errorMessage = errorMessage;
    return this;
  }

  public build = (): ValidationResult => {
    return {
      result: this.valid,
      errorMessage: this.errorMessage,
    };
  }
}