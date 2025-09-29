import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AgreementNav } from "../AgreementNav"

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
    EditIcon: () => <div data-testid="edit-icon" />,
    HandCoinsIcon: () => <div data-testid="hand-coins-icon" />,
    TablePropertiesIcon: () => <div data-testid="table-properties-icon" />,
    UsersRoundIcon: () => <div data-testid="users-round-icon" />,
}))

// Mock do componente Link do Next.js para funcionar no ambiente de teste
jest.mock("next/link", () => {
    // eslint-disable-next-line react/display-name
    return ({
        children,
        href,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        prefetch,
        ...props
    }: {
        children: React.ReactNode
        href: string
        prefetch?: boolean
    }) => {
        return (
            <a href={href} {...props}>
                {children}
            </a>
        )
    }
})

describe("AgreementNav", () => {
    const agreementId = "agreement-123"
    const serviceId = "service-456"

    it("should render nothing if no ids are provided", () => {
        const { container } = render(<AgreementNav />)
        expect(container).toHaveTextContent("")
    })

    it("should render only the Agreement dropdown when agreementId is provided", async () => {
        render(<AgreementNav agreementId={agreementId} />)

        const agreementTrigger = screen.getByRole("button", {
            name: /Agreement/i,
        })
        expect(agreementTrigger).toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: /Services/i }),
        ).not.toBeInTheDocument()

        await userEvent.click(agreementTrigger)

        const editAgreementLink = screen.getByRole("menuitem", {
            name: /Edit Agreement/i,
        })
        const listServicesLink = screen.getByRole("menuitem", {
            name: /List Services/i,
        })

        expect(editAgreementLink).toBeInTheDocument()
        expect(editAgreementLink.closest("a")).toHaveAttribute(
            "href",
            `/agreements/form?agreementId=${agreementId}`,
        )

        expect(listServicesLink).toBeInTheDocument()
        expect(listServicesLink.closest("a")).toHaveAttribute(
            "href",
            `/agreements/${agreementId}/services`,
        )
    })

    it("should render both dropdowns when agreementId and serviceId are provided", async () => {
        render(<AgreementNav agreementId={agreementId} serviceId={serviceId} />)

        // Verifica o menu "Agreement"
        const agreementTrigger = screen.getByRole("button", {
            name: /Agreement/i,
        })
        expect(agreementTrigger).toBeInTheDocument()

        // Verifica o menu "Services"
        const servicesTrigger = screen.getByRole("button", {
            name: /Services/i,
        })
        expect(servicesTrigger).toBeInTheDocument()
        await userEvent.click(servicesTrigger)

        const editServiceLink = screen.getByRole("menuitem", {
            name: /Edit Service/i,
        })
        const costAllocationLink = screen.getByRole("menuitem", {
            name: /Cost Allocation/i,
        })
        const usersListLink = screen.getByRole("menuitem", {
            name: /Users List/i,
        })

        expect(editServiceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?serviceId=${serviceId}`,
        )
        expect(costAllocationLink.closest("a")).toHaveAttribute(
            "href",
            `/services/${serviceId}`,
        )
        expect(usersListLink.closest("a")).toHaveAttribute(
            "href",
            `/services/${serviceId}/users`,
        )
    })

    it("should omit the 'Edit Agreement' menu item", async () => {
        render(<AgreementNav agreementId={agreementId} omit="agreement" />)
        const trigger = screen.getByRole("button", { name: /Agreement/i })
        await userEvent.click(trigger)

        expect(
            screen.queryByRole("menuitem", { name: /Edit Agreement/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /List Services/i }),
        ).toBeInTheDocument()
    })

    it("should omit the 'Cost Allocation' menu item", async () => {
        render(
            <AgreementNav
                agreementId={agreementId}
                serviceId={serviceId}
                omit="allocation"
            />,
        )
        const trigger = screen.getByRole("button", { name: /Services/i })
        await userEvent.click(trigger)

        expect(
            screen.queryByRole("menuitem", { name: /Cost Allocation/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /Edit Service/i }),
        ).toBeInTheDocument()
    })

    it("should omit the 'List Services' menu item", async () => {
        render(
            <AgreementNav
                agreementId={agreementId}
                serviceId={serviceId}
                omit="services"
            />,
        )
        const trigger = screen.getByRole("button", { name: /Agreement/i })
        await userEvent.click(trigger)

        expect(
            screen.queryByRole("menuitem", { name: /List Services/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /Edit Agreement/i }),
        ).toBeInTheDocument()
    })

    it("should omit the 'Edit Service' menu item", async () => {
        render(
            <AgreementNav
                agreementId={agreementId}
                serviceId={serviceId}
                omit="service"
            />,
        )
        const trigger = screen.getByRole("button", { name: /Services/i })
        await userEvent.click(trigger)

        expect(
            screen.queryByRole("menuitem", { name: /Edit Service/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /Cost Allocation/i }),
        ).toBeInTheDocument()
    })

    it("should omit the 'Users List' menu item", async () => {
        render(
            <AgreementNav
                agreementId={agreementId}
                serviceId={serviceId}
                omit="users"
            />,
        )
        const trigger = screen.getByRole("button", { name: /Services/i })
        await userEvent.click(trigger)

        expect(
            screen.queryByRole("menuitem", { name: /Users List/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /Edit Service/i }),
        ).toBeInTheDocument()
    })

    it("should omit the 'Users List' menu item when omit is 'users'", async () => {
        render(
            <AgreementNav
                agreementId={agreementId}
                serviceId={serviceId}
                omit="users"
            />,
        )
        const trigger = screen.getByRole("button", { name: /Services/i })
        await userEvent.click(trigger)

        expect(
            screen.queryByRole("menuitem", { name: /Users List/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /Edit Service/i }),
        ).toBeInTheDocument()
    })
})
