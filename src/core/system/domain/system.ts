import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { SystemValidator } from "./system.validator"

export type SystemConstructorProps = {
    systemId: string
    name: string
    description: string
    applicationId: string
}

export type SystemCreateCommand = Omit<SystemConstructorProps, "systemId">

export class System {
    systemId: string
    name: string
    description: string
    applicationId: string

    constructor(props: SystemConstructorProps) {
        this.systemId = props.systemId
        this.name = props.name
        this.description = props.description
        this.applicationId = props.applicationId
    }

    static create(props: SystemCreateCommand) {
        return new System({
            systemId: new Uuid().toString(),
            ...props,
        })
    }

    changeName(name: string) {
        this.name = name
    }

    changeDescription(description: string) {
        this.description = description
    }

    changeApplicationId(applicationId: string) {
        this.applicationId = applicationId
    }

    validate() {
        const validator = new SystemValidator()
        validator.validate(this)
    }

    toJSON() {
        return {
            systemId: this.systemId,
            name: this.name,
            description: this.description,
            applicationId: this.applicationId,
        }
    }
}
