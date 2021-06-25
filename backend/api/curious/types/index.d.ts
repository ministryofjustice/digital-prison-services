declare namespace curious {
  /**
   *
   * @export
   * @interface Assessment
   */
  export interface Assessment {
    /**
     * The date the assessment has been taken
     * @type {string}
     * @memberof Assessment
     */
    assessmentDate?: string
    /**
     * Assessment Grade
     * @type {string}
     * @memberof Assessment
     */
    qualificationGrade?: string
    /**
     * Assessment Type
     * @type {string}
     * @memberof Assessment
     */
    qualificationType?: AssessmentQualificationType
  }

  /**
   * @export
   * @enum {string}
   */
  export enum AssessmentQualificationType {
    English = 'English',
    Maths = 'Maths',
    DigitalLiteracy = 'Digital Literacy',
  }

  /**
   *
   * @export
   * @interface LearnerAssessment
   */
  export interface LearnerAssessment {
    /**
     * Establishment (prison) identifier
     * @type {number}
     * @memberof LearnerAssessment
     */
    establishmentId?: number
    /**
     * Establishment (prison) name
     * @type {string}
     * @memberof LearnerAssessment
     */
    establishmentName?: string
    /**
     *
     * @type {Assessment}
     * @memberof LearnerAssessment
     */
    qualification?: Assessment
  }

  /**
   *
   * @export
   * @interface LearnerEducation
   */
  export interface LearnerEducation {
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    a2LevelIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    accessHEIndicator?: boolean
    /**
     * Actual Guided Learning Hours allocated to course
     * @type {number}
     * @memberof LearnerEducation
     */
    actualGLH?: number
    /**
     * The sequence number of Course for a learner
     * @type {number}
     * @memberof LearnerEducation
     */
    aimSequenceNumber?: number
    /**
     *
     * @type {boolean}
     * @memberof LearnerEducation
     */
    alevelIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    asLevelIndicator?: boolean
    /**
     * Actual attended Guided Learning Hours by learner on course
     * @type {number}
     * @memberof LearnerEducation
     */
    attendedGLH?: number
    /**
     * Course completion Status
     * @type {string}
     * @memberof LearnerEducation
     */
    completionStatus?: string
    /**
     * Unique Course Code
     * @type {string}
     * @memberof LearnerEducation
     */
    courseCode?: string
    /**
     * Course Name
     * @type {string}
     * @memberof LearnerEducation
     */
    courseName?: string
    /**
     * Post code of a location where this course is getting delivered
     * @type {string}
     * @memberof LearnerEducation
     */
    deliveryLocationPostCode?: string
    /**
     * Course Delivery Method
     * @type {string}
     * @memberof LearnerEducation
     */
    deliveryMethodType?: LearnerEducationDeliveryMethodType
    /**
     * Employment Outcome gained status associated with the course (with training, without training)
     * @type {string}
     * @memberof LearnerEducation
     */
    employmentOutcome?: string
    /**
     * Establishment (prison) identifier
     * @type {number}
     * @memberof LearnerEducation
     */
    establishmentId?: number
    /**
     * Establishment (prison) name
     * @type {string}
     * @memberof LearnerEducation
     */
    establishmentName?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    functionalSkillsIndicator?: boolean
    /**
     * Funding adjustment hours from prior learning
     * @type {number}
     * @memberof LearnerEducation
     */
    fundingAdjustmentPriorLearning?: number
    /**
     * Funding Model for a Course
     * @type {string}
     * @memberof LearnerEducation
     */
    fundingModel?: string
    /**
     * Funding type for a course
     * @type {string}
     * @memberof LearnerEducation
     */
    fundingType?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    gceIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    gcsIndicator?: boolean
    /**
     * Indicates if the course is accredited
     * @type {boolean}
     * @memberof LearnerEducation
     */
    isAccredited?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    keySkillsIndicator?: boolean
    /**
     * Learners aim on Course
     * @type {string}
     * @memberof LearnerEducation
     */
    learnersAimType?: string
    /**
     * Actual Course end date
     * @type {string}
     * @memberof LearnerEducation
     */
    learningActualEndDate?: string
    /**
     * Planned Course end date
     * @type {string}
     * @memberof LearnerEducation
     */
    learningPlannedEndDate?: string
    /**
     * Course start date
     * @type {string}
     * @memberof LearnerEducation
     */
    learningStartDate?: string
    /**
     * Number of Guided Learning hours from LRS
     * @type {number}
     * @memberof LearnerEducation
     */
    lrsGLH?: number
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    miNotionalNVQLevelV2?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    occupationalIndicator?: boolean
    /**
     * Outcome of Course
     * @type {string}
     * @memberof LearnerEducation
     */
    outcome?: string
    /**
     * Outcome grade of Course
     * @type {string}
     * @memberof LearnerEducation
     */
    outcomeGrade?: string
    /**
     * Withdrawal reason if the learner withdraws from course
     * @type {string}
     * @memberof LearnerEducation
     */
    prisonWithdrawalReason?: string
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerEducation
     */
    prn?: string
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    qcfCertificateIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    qcfDiplomaIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {boolean}
     * @memberof LearnerEducation
     */
    qcfIndicator?: boolean
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    sectorSubjectAreaTier1?: string
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    sectorSubjectAreaTier2?: string
    /**
     * Course Indicator from LRS
     * @type {number}
     * @memberof LearnerEducation
     */
    subcontractedPartnershipUKPRN?: number
    /**
     * Course Indicator from LRS
     * @type {string}
     * @memberof LearnerEducation
     */
    unitType?: string
    /**
     * Indicates if withdrawal is agreed or not
     * @type {boolean}
     * @memberof LearnerEducation
     */
    withdrawalReasonAgreed?: boolean
    /**
     * Withdrawal reason (defaulted to Other) populated for the courses which are withdrawn
     * @type {string}
     * @memberof LearnerEducation
     */
    withdrawalReasons?: string
  }

  /**
   *
   * @export
   * @interface LearnerProfile
   */
  export interface LearnerProfile {
    /**
     * Establishment (prison) identifier
     * @type {number}
     * @memberof LearnerProfile
     */
    establishmentId?: number
    /**
     * Establishment (prison) name
     * @type {string}
     * @memberof LearnerProfile
     */
    establishmentName?: string
    /**
     * Language Status
     * @type {string}
     * @memberof LearnerProfile
     */
    languageStatus?: string
    /**
     * Learner Self Assessment LDD and Health Problem
     * @type {string}
     * @memberof LearnerProfile
     */
    lddHealthProblem?: string
    /**
     * Planned Learning Hours
     * @type {number}
     * @memberof LearnerProfile
     */
    plannedHours?: number
    /**
     * Overall attainment level of learners that have achieved various combinations of qualifications
     * @type {string}
     * @memberof LearnerProfile
     */
    priorAttainment?: string
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerProfile
     */
    prn?: string
    /**
     *
     * @type {Array<Assessment>}
     * @memberof LearnerProfile
     */
    qualifications?: Array
    /**
     * Unique Learner Number
     * @type {string}
     * @memberof LearnerProfile
     */
    uln?: string
  }

  /**
   * @export
   * @enum {string}
   */
  export enum LearnerEducationDeliveryMethodType {
    BlendedLearning = 'Blended Learning',
    ClassroomOnlyLearning = 'Classroom Only Learning',
    PackOnlyLearning = 'Pack Only Learning',
  }

  /**
   *
   * @export
   * @interface LearnerLatestAssessment
   */
  export interface LearnerLatestAssessment {
    /**
     * NOMIS Assigned Offender Number (Prisoner Identifier)
     * @type {string}
     * @memberof LearnerLatestAssessment
     */
    prn: string
    /**
     *
     * @type {Array<LearnerAssessment>}
     * @memberof LearnerLatestAssessment
     */
    qualifications?: LearnerAssessment[]
  }
}
