import type { Meta, StoryObj } from '@storybook/angular';
import { TasInputPassword } from '@talisoft/ui/input-password';

type InputPasswordArgs = TasInputPassword;

const meta: Meta<InputPasswordArgs> = {
  component: TasInputPassword,
  title: 'Components / Inputs / Input Password',

}
export default meta;
type Story = StoryObj<InputPasswordArgs>;

export const Primary: Story = {
  render: ({...args}) => ({
    props: args,
    template: `
    <tas-input-password>Password</tas-input-password>
    `
  }),
};