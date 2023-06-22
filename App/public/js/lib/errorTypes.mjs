/**
 * @fileOverview  Defines error classes (also called "exception" classes)
 * for property constraint violations
 * @author Gerd Wagner
 */
class ConstraintViolation {
  constructor(msg) {
    this.message = msg;
  }
}

export { ConstraintViolation };
