import { Router } from "express";
import {
	getMyGroups,
	getGroupById,
	addMemberToGroup,
	removeMemberFromGroup,
	getGroupMembers,
	getGroupMessages,
	getConversations,
	getDirectMessages,
	searchContacts,
} from "../controllers/chat.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

// Personal / Direct messages
router.get("/conversations", getConversations);
router.get("/conversations/:contactId/messages", getDirectMessages);
router.get("/contacts/search", searchContacts);

// Group chat
router.get("/groups", getMyGroups);
router.get("/groups/:groupId", getGroupById);
router.get("/groups/:groupId/members", getGroupMembers);
router.post("/groups/:groupId/members", addMemberToGroup);
router.delete("/groups/:groupId/members/:memberId", removeMemberFromGroup);
router.get("/groups/:groupId/messages", getGroupMessages);

export default router;
