/**
 * Talisoft.Lotchen.API
 * The Lotchen API description
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface FindAllTasksQueryResponse { 
    /**
     * Task ID
     */
    id: string;
    /**
     * tasks onwer id
     */
    ownerId: string;
    /**
     * Task type
     */
    taskType: string;
    /**
     * Task title
     */
    title: string;
    /**
     * Task description
     */
    description: string;
    /**
     * Due Date
     */
    dueDate: string;
    /**
     * Due Date time
     */
    dueDatetime: string;
    /**
     * Marked task as completed
     */
    markedAsCompletedAt: string;
}

