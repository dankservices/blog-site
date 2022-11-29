import { Footer } from "flowbite-react";
import { BsEnvelope, BsDiscord, BsGithub } from "react-icons/bs";
export default function DsFooter() {
    return (
        <Footer container={true}>
            <div className="w-full">
                <div className="w-full sm:flex sm:items-center sm:justify-between">
                    <Footer.Copyright
                        href="https://dankservices.com"
                        by="DankServices"
                        year={2022}
                    />
                    <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
                        <Footer.Icon
                            href="mailto:dank@dankservices.com"
                            icon={BsEnvelope}
                        />
                        <Footer.Icon
                            href="https://github.com/dankservices"
                            icon={BsGithub}
                        />
                        <Footer.Icon
                            href="#"
                            icon={BsDiscord}
                        />
                    </div>
                </div>
            </div>
        </Footer>
    )
}