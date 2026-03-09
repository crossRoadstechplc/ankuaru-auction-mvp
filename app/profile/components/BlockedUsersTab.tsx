"use client";

import { User } from "../../../lib/types";
import UserList from "./UserList";

interface BlockedUsersTabProps {
  users: User[];
}

export default function BlockedUsersTab({ users }: BlockedUsersTabProps) {
  return (
    <UserList
      users={users}
      title="Blocked Users"
      emptyMessage="You haven't blocked any users."
      showFollowButton={false}
      showUnfollowButton={false}
      showBlockButton={false}
      showUnblockButton={true}
    />
  );
}
