import User from "../models/User.js";
import Intern from "../models/Intern.js";
import Mentor from "../models/Mentor.js";

/**
 * Validates that an email is unique across all people (Users, Interns, and Mentors).
 *
 * @param {string} email - Email to check.
 * @param {object} [exclude] - Optional identifiers to exclude during updates.
 * @param {string|mongoose.Types.ObjectId} [exclude.internId] - ID of intern being updated.
 * @param {string|mongoose.Types.ObjectId} [exclude.mentorId] - ID of mentor being updated.
 * @param {string|mongoose.Types.ObjectId} [exclude.userId] - ID of user being updated.
 * @param {string} [exclude.currentEmail] - The person's existing email before updating.
 * @returns {Promise<{ isTaken: boolean, message?: string }>}
 */
export async function checkEmailUnique(email, exclude = {}) {
    if (!email || typeof email !== "string") {
        return { isTaken: false };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const currentEmail = (exclude.currentEmail || "").toLowerCase().trim();

    // If updating and the email hasn't changed, it's allowed
    if (currentEmail && currentEmail === normalizedEmail) {
        return { isTaken: false };
    }

    // 1. Check User collection
    const userQuery = { email: normalizedEmail };
    if (exclude.userId) {
        userQuery._id = { $ne: exclude.userId };
    }
    const existingUser = await User.findOne(userQuery);
    if (existingUser) {
        // If updating an intern/mentor, allow if this user is their existing login account
        const isOwnLoginAccount = currentEmail && existingUser.email === currentEmail;
        if (!isOwnLoginAccount) {
            const roleLabel = existingUser.role ? `an account with role '${existingUser.role}'` : "an existing user account";
            return {
                isTaken: true,
                message: `This email address is already registered to ${roleLabel}. Email must be unique for all people.`
            };
        }
    }

    // 2. Check Intern collection
    const internQuery = { email: normalizedEmail };
    if (exclude.internId) {
        internQuery._id = { $ne: exclude.internId };
    }
    const existingIntern = await Intern.findOne(internQuery);
    if (existingIntern) {
        return {
            isTaken: true,
            message: `This email address is already in use by an intern (${existingIntern.name}). Email must be unique for all people.`
        };
    }

    // 3. Check Mentor collection
    const mentorQuery = { email: normalizedEmail };
    if (exclude.mentorId) {
        mentorQuery._id = { $ne: exclude.mentorId };
    }
    const existingMentor = await Mentor.findOne(mentorQuery);
    if (existingMentor) {
        return {
            isTaken: true,
            message: `This email address is already in use by a mentor (${existingMentor.name}). Email must be unique for all people.`
        };
    }

    return { isTaken: false };
}
