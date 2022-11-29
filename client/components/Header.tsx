import { Avatar, Dropdown, Navbar} from "flowbite-react";
import Image from "next/image";
import { Dispatch, SetStateAction} from "react";
import { ActivePage } from "../interfaces/Client";
import { NavbarLink } from "./NavbarLink";

interface HeaderProps {
    activePage: ActivePage;
    setActivePage: Dispatch<SetStateAction<ActivePage>>;
}

export default function Header(props: HeaderProps) {
    const activePage = props.activePage;
    const setActivePage = props.setActivePage;
    return (
        <Navbar
            fluid={true}
            className="border-b border-gray-200 dark:border-gray-900"
        >
            <Navbar.Brand href="#">
                <img
                    src="/logo.png"
                    className="mr-3 h-6 sm:h-9 rounded-full"
                    alt="DS Logo"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                    DankServices
                </span>
            </Navbar.Brand>
            <div className="flex md:order-2">
                <Dropdown
                    arrowIcon={false}
                    inline={true}
                    label={<Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded={true} />}
                >
                    <Dropdown.Header>
                        <span className="block text-sm">
                            Test User
                        </span>
                        <span className="block truncate text-sm font-medium">
                            testuser@dankservices.com
                        </span>
                    </Dropdown.Header>
                    <Dropdown.Item>
                        Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item>
                        Settings
                    </Dropdown.Item>
                    <Dropdown.Item>
                        Messages
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item>
                        Sign out
                    </Dropdown.Item>
                </Dropdown>
                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                <button onClick={() => { setActivePage(ActivePage.Home) }}>
                <NavbarLink
                    active={activePage === ActivePage.Home}
                    href="/"
                >
                    Home
                </NavbarLink>
                </button>
                <button onClick={() => { setActivePage(ActivePage.Services) }}>
                <NavbarLink 
                    href="/services" 
                    active={activePage === ActivePage.Services}>
                    Services
                </NavbarLink>
                </button>
                <button onClick={() => { setActivePage(ActivePage.Series) }}>
                    <NavbarLink
                        href="/series"
                        active={activePage === ActivePage.Series}>
                        Series
                    </NavbarLink>
                </button>
                <button onClick={() => { setActivePage(ActivePage.Blog) }}>
                <NavbarLink 
                    href="/blog"
                    active={activePage === ActivePage.Blog}>
                    Blog
                </NavbarLink>
                </button>
                <button onClick={() => { setActivePage(ActivePage.Contact) }}>
                <NavbarLink 
                    href="/contact" 
                    active={activePage === ActivePage.Contact}>
                    Contact
                </NavbarLink>
                </button>
            </Navbar.Collapse>
        </Navbar>
    )
}